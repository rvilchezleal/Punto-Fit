// js/supabase-client.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const supabaseClient = createClient(
    'https://elnxlsydfdndolrcdyri.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsbnhsc3lkZmRuZG9scmNkeXJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjQ2OTMsImV4cCI6MjA5NzMwMDY5M30.wbNAcdOydljDpRGD9QP3KZ9RT7X3WPDTfkCfJTEZ2yc'
);