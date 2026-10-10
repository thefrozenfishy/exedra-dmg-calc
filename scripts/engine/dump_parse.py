"""Parse Il2CppDumper dump.cs into JSON for the ReDriveBattleCore namespaces (incl. nested types)."""
import re,json,sys
src=sys.argv[1]; out=sys.argv[2]
txt=open(src,encoding='utf-8',errors='ignore').read()
blocks=re.split(r'\n(?=// Namespace: )',txt)
TYPE_RE=re.compile(r'^((?:(?:public|private|protected|internal|static|abstract|sealed|readonly|ref|unsafe)\s+)*)(class|struct|enum|interface)\s+(\S+?)(?:\s*:\s*(.+?))?\s*// TypeDefIndex: (\d+)$')
FIELD_RE=re.compile(r'^((?:(?:public|private|protected|internal|static|readonly|const|volatile|new|fixed)\s+)*)(.+?)\s+([^\s=]+)(?:\s*=\s*(.+?))?;(?:\s*// (0x[0-9A-F]+))?$')
PROP_RE=re.compile(r'^((?:(?:public|private|protected|internal|static|abstract|virtual|override|sealed|new|extern)\s+)*)(.+?)\s+(\S+)\s*\{\s*((?:get;|set;|\s)*)\}$')
METH_RE=re.compile(r'^((?:(?:public|private|protected|internal|static|abstract|virtual|override|sealed|new|extern|unsafe)\s+)*)(.+?)\s+((?:[^\s(<>]|<[^()]*?>)+)\((.*)\)\s*(?:\{\s*\}|;)$')
RVA_RE=re.compile(r'// RVA: (0x[0-9A-F]+|-1).*?(?:Slot: (\d+))?$')
def split_params(s):
    out=[];d=0;cur=''
    for ch in s:
        if ch in '<([':d+=1
        if ch in '>)]':d-=1
        if ch==',' and d==0: out.append(cur.strip());cur=''
        else: cur+=ch
    if cur.strip(): out.append(cur.strip())
    res=[]
    for p in out:
        dflt=None
        if '=' in p:
            p,dflt=p.split('=',1);p=p.strip();dflt=dflt.strip()
        toks=p.split()
        mod=[t for t in toks[:-2] if t in('out','ref','in','params','this')]
        typ=' '.join(t for t in toks[:-1] if t not in('out','ref','in','params','this'))
        res.append({'name':toks[-1],'type':typ,'mod':mod,'default':dflt})
    return res
types=[]
for b in blocks:
    lines=b.split('\n')
    m=re.match(r'// Namespace: ?(.*)$',lines[0])
    if not m: continue
    ns=m.group(1).strip()
    i=1
    while i<len(lines) and (lines[i].startswith('[') or not lines[i].strip()): i+=1
    if i>=len(lines):continue
    tm=TYPE_RE.match(lines[i].strip())
    if not tm: continue
    mods,kind,name,bases,idx=tm.groups()
    bases=[x.strip() for x in re.split(r',(?![^<]*>)',bases)] if bases else []
    t={'ns':ns,'name':name,'kind':kind,'mods':mods.split(),'bases':bases,'index':int(idx),'fields':[],'props':[],'methods':[]}
    sect=None;pend=None;attrs=[]
    for l in lines[i+1:]:
        s=l.strip()
        if s=='// Fields':sect='f';continue
        if s=='// Properties':sect='p';continue
        if s=='// Methods':sect='m';continue
        if s.startswith('// RVA:'):
            r=RVA_RE.match(s);pend={'rva':r.group(1),'slot':int(r.group(2)) if r.group(2) else None};continue
        if s.startswith('['):attrs.append(s);continue
        if not s or s.startswith('//') or s in('{','}') or s.startswith('/*') or s.startswith('|') or s.startswith('*/'): continue
        if sect=='f':
            fm=FIELD_RE.match(s)
            if fm:
                fmods,ft,fn,fv,off=fm.groups()
                t['fields'].append({'name':fn,'type':ft,'mods':fmods.split(),'value':fv,'offset':off,'attrs':attrs})
        elif sect=='p':
            pm=PROP_RE.match(s)
            if pm: t['props'].append({'name':pm.group(3),'type':pm.group(2),'mods':pm.group(1).split(),'acc':pm.group(4).split()})
        elif sect=='m':
            mm=METH_RE.match(s)
            if mm:
                mmods,ret,mn,params=mm.groups()
                gm=re.match(r'(.+?)<(.+)>$',mn)
                gen=None
                if gm: mn,gen=gm.group(1),[x.strip() for x in gm.group(2).split(',')]
                t['methods'].append({'name':mn,'ret':ret,'mods':mmods.split(),'params':split_params(params),'generic':gen,'rva':(pend or {}).get('rva'),'slot':(pend or {}).get('slot'),'sig':s})
            pend=None
        attrs=[]
    types.append(t)
# keep ReDriveBattleCore (minus debug tooling), the shared battle definitions, and nested types of those
SKIP_NS=('ReDriveBattleCore.DebugTool','ReDriveBattleCore.Debugging')
EXTRA_NS=('Network.Definition.Battle',)
EXTRA_NAMES={('Network.Definition.QuestOutGame','LinkHpType'),('Network.Definition.QuestOutGame','EnemyUnlockType'),
             ('Network.Definition.QuestBattle','EnemyType'),('Network.Definition.QuestBattle','SizeType'),
             ('Network.Definition.Skill','AbilityEffectCategory'),('Network.Definition.CalcPoint','CalculationPointPolicyType')}
def wanted(t):
    ns=t['ns']
    if ns.startswith(SKIP_NS): return False
    return ns.startswith('ReDriveBattleCore') or ns in EXTRA_NS or (ns,t['name']) in EXTRA_NAMES
inc={};keep=[]
for t in types:
    if wanted(t): inc[t['name']]=t
for t in types:
    if wanted(t): keep.append(t);continue
    if t['ns']=='' and '.' in t['name'] and t['name'].split('.')[0] in inc:
        outer=t['name'].split('.')[0].split('<')[0]
        o=inc.get(outer) or next((v for k,v in inc.items() if k.split('<')[0]==outer),None)
        if o and abs(o['index']-t['index'])<400:
            t['ns']=o['ns'];t['nested']=True;keep.append(t)
json.dump(keep,open(out,'w'),indent=0)
print(len(types),'types,',len(keep),'kept')
import collections
print(collections.Counter((t['ns'],t['kind']) for t in keep).most_common(40))
