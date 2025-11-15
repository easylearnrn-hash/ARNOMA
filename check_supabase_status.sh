#!/bin/bash

# EMERGENCY: Check Supabase project status and get new keys if needed

echo "🔍 CHECKING SUPABASE PROJECT STATUS"
echo "===================================="
echo ""

# Get project details
curl -s "https://zlvnxvrzotamhpezqedr.supabase.co/rest/v1/" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsdm54dnJ6b3RhbWhwZXpxZWRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0NjU0NDgsImV4cCI6MjA0NjA0MTQ0OH0.xJxL6HXuCVlxvnEqmRO8yXQMY1GCFMGCo4e2MhEFT-Y"

echo ""
echo ""
echo "===================================="
echo "📋 NEXT STEPS:"
echo "===================================="
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/zlvnxvrzotamhpezqedr"
echo "2. Login to Supabase dashboard"
echo "3. Go to: Settings → API"
echo "4. Copy the 'anon' 'public' key"
echo "5. Replace SUPABASE_ANON_KEY in index.html"
echo "6. Run: ./validate_deployment.sh"
echo "7. Deploy: git commit + git push"
echo ""
echo "🔒 POSSIBLE ISSUES:"
echo "   - API keys might have been regenerated"
echo "   - RLS policies might be blocking reads"
echo "   - Project might be paused/suspended"
echo ""
