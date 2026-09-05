create index if not exists analytics_created_at_id_idx
  on analytics (created_at desc, id desc);