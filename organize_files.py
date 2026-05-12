import os
import shutil

# Define the root and target base directory
root_dir = r"c:\Users\tlduf\.cursor\projects\dev3_nomu"
docs_dir = os.path.join(root_dir, "docs")

# Define categories
categories = {
    "01_Architecture_Rules": [
        "architecture.md", "backend_rules.md", "fullstack_spec.md", "rules.md", 
        "workflow.md", "email.md", "Logic Manifesto.md"
    ],
    "02_Deployment_Vercel": [
        "DEPLOYMENT_CHECKLIST.md", "DEPLOYMENT_PLAN.md", "DEPLOYMENT_SUMMARY.md",
        "DEPLOYMENT_TEST.md", "PHASE1_COMPLETION_SUMMARY.md", "PHASE1_DEPLOYMENT_GUIDE.md",
        "PHASE2_DEPLOYMENT_GUIDE.md", "PHASE3_DEPLOYMENT_GUIDE.md", "VERCEL_BUILD_FIX.md",
        "VERCEL_BUTTON_DEBUG_GUIDE.md", "VERCEL_DEBUG_GUIDE.md", "VERCEL_DEPLOYMENT.md",
        "VERCEL_DEPLOYMENT_GUIDE.md", "VERCEL_WARNINGS_RESOLUTION.md", "vercel_buildlogs_error.md",
        "vercel_buildlogs_errors.md", "vercel_error88.md", "build_output.txt", "DEVOPS_PLAN.md"
    ],
    "03_Database_Supabase": [
        "SUPABASE_DATABASE_SETUP_GUIDE.md", "SUPABASE_EMAIL_SETUP_GUIDE.md", "SUPABASE_EMAIL_TEST.md",
        "SUPABASE_INDEX_INSTALLATION.md", "SUPABASE_INIT_COMPLETE.md", "SUPABASE_INIT_GUIDE.md",
        "SUPABASE_PRODUCTION_GUIDE.md", "SUPABASE_RECOVERY_GUIDE.md", "SUPABASE_SETUP.md",
        "check-rls-status.sql", "check_rls.sql", "enable-rls-all-tables.sql", "apply_rls.md",
        "RLS_APPLY_STEPS.md", "RLS_SETUP.md"
    ],
    "04_Guides_UX": [
        "EMAIL_UX_IMPROVEMENTS.md", "ENV_SETUP_GUIDE.md", "GET_ACCESS_TOKEN.md",
        "GITHUB_SECRETS_GUIDE.md", "GMAIL_SMTP_SETUP_GUIDE.md", "INTEGRATION_GUIDE.md",
        "LANDING_PAGE_ISSUES.md", "MIGRATION_DASHBOARD_GUIDE.md", "MIGRATION_GUIDE.md",
        "QUICK_FIX_GUIDE.md", "UX_IMPROVEMENT_GUIDE.md", "UX_IMPROVEMENT_REPORT.md",
        "AUTH_COMPLETE.md", "OAUTH_SETUP.md", "UI_REFORM_PLAN.md", ".SOCIAL_LOGIN_GUIDE.md.backup"
    ],
    "05_AI_Agents": [
        "AI_AGENTS_COMPLETE_GUIDE.md", "CLAUDE.md", "HARNESS_ENGINEERING.md",
        "MCP_SETUP_GUIDE.md", "RECOMMENDED_MCP_SERVERS.md", "ORCHESTRATOR.md",
        "Project Orchestrator.md", "Field Manager OS.md", "AI_SCENARIO_3_MARKET_SCOUT.md"
    ],
    "06_Testing_Reports": [
        "CONNECTION_TEST_REPORT.md", "EMAIL_TESTING_PLAN.md", "FINAL_TEST_REPORT.md",
        "PHASE2-3_TEST_REPORT.md", "PHASE_4_5_TEST_REPORT.md", "PHASE_7_TEST_AUTOMATION_REPORT.md",
        "TEST_REPORT.md", "test-connection.mjs", "test-insert.js", "test-supabase.js"
    ],
    "07_Planning_Logs": [
        "DEVELOPMENT_LOG.md", "DEVELOPMENT_LOG_2026-04-22.md", "DEVELOPMENT_LOG_2026-05-02.md",
        "FIELD_MANAGER_OS_AI_PLAN.md", "FREE_LAUNCH_STRATEGY.md", "NEXT_STEPS.md",
        "PARALLEL_WORK_CHECKLIST.md", "REMAINING_TASKS.md", "IMPROVEMENTS.md", "PROJECT_makerting"
    ],
    "08_Assets_Excel": [
        "2026년-일용직-노임대장-양식v1.xlsx", "샘플_더존하우징_곤지암삼리_노임대장.xlsx",
        "excel_layout.json", "read_excel.py"
    ]
}

# Create category directories inside docs/
for category in categories:
    cat_dir = os.path.join(docs_dir, category)
    if not os.path.exists(cat_dir):
        os.makedirs(cat_dir)

# Move files
for category, items in categories.items():
    cat_dir = os.path.join(docs_dir, category)
    for item in items:
        # Check root_dir first
        source_path = os.path.join(root_dir, item)
        # If not in root, check if it's already in docs/
        if not os.path.exists(source_path):
            source_path = os.path.join(docs_dir, item)
        
        if os.path.exists(source_path):
            dest_path = os.path.join(cat_dir, item)
            try:
                shutil.move(source_path, dest_path)
                print(f"Moved: {item} -> {category}")
            except Exception as e:
                print(f"Error moving {item}: {e}")
        else:
            print(f"Not found: {item}")

print("\nOrganization complete!")
