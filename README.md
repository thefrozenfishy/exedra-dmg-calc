A little dmg calculator to find your best bet at beating Score Attack, or test your luck in Chaos mode

## Simple use
There's 2 ways to use the script. The first is to check the max dmg of a single team. Do this in the ``single_team_test.py`` file. Simply set up your team, change the values that can be changed, and run, it'll print something like ``2,485,529 with 30% Crit rate``.  
Fyi, the script assumes +45ATK & +10% Crit Dmg substats on all crystalis on the attacker.  
The available crystalis abilities for attackers are ``["ATK%-25", "CD-20", "Elem-24", "Dmg-20", "ATK-125", "EX"]``,  ATK percent up, crit dmg, vs weak element dmg, dmg up when attacking element, flat atk+ and EX respectively. 

## Simulation use
The other way is to use the terminal. Run ``python.exe max_dmg_calc.py --h`` for explanation. Generally it will read your team from ``my_team.json`` and use that when simulating, assuming you have all 4* A5 (This rarely matters anyways). Results are stored in ``results``. a_ and b_ is just technical, they contain the same data. 
``my_team.json`` is a json file where the keys are the kioku name and the value is the kioku's ascension. all skill levels etc are assumed to be maxed as much as possible.

This will take some time, but it stores underway so you can cancel and it'll start up where it left off as long as the name, break, def, ml and kioku level stays the same. If you want to see the pretty print just rerun with the same config. 

If you change the ascension of any of your team members in ``my_team.json`` it will rerun all simulations including that character

Example run: ``python max_dmg_calc.py --custom --supp --name tff``

This is identical to going into ``multi_team_run.py`` where you can change the config directly, if this is preferable