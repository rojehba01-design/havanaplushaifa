/* ============================================================
   Havana Plus — connection to Tafriti (tafriti.com)

   The key below is Supabase's PUBLIC "anon" key — the same one the
   tafriti.com page itself ships, designed to live in a browser. What
   protects the data is row-level security: with this key a visitor
   can only READ a switched-on business's menu. Nothing can be written.

   Until a business with this slug exists on Tafriti, the pages simply
   keep the menu shipped in menu-data.js.
   ============================================================ */
window.TAFRITI = {
  url: 'https://hiqeichpfdpgiwocjdsj.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpcWVpY2hwZmRwZ2l3b2NqZHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNjQ0MDAsImV4cCI6MjEwNDY0MDQwMH0.o09uj0FStRd2lgpOMP7gMS1fwCQoyqFif0CMQFARiBk',
  slug: 'havana-plus'
};
