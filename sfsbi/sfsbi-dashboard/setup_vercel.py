import subprocess, os

PROJECT_DIR = r"C:\Users\hardi\Downloads\Maritimw\sfsbi\sfsbi-dashboard"

env_vars = {
    "NEXT_PUBLIC_SUPABASE_URL": "https://xoxpslsbnkxcthdmfbwn.supabase.co",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhveHBzbHNibmt4Y3RoZG1mYnduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MzgxNjEsImV4cCI6MjA5MTIxNDE2MX0.CjS0V9s9jGTN_qdAZV96fQIEd0GFzQnZKukLxABnffc",
    "RETELL_API_KEY": "key_70acf8e731936d5abafc26e9d116",
}

for key, value in env_vars.items():
    print(f"Adding {key}...")
    result = subprocess.run(
        f'echo {value} | npx vercel env add {key} production',
        capture_output=True,
        text=True,
        cwd=PROJECT_DIR,
        shell=True
    )
    out = (result.stdout + result.stderr).strip()
    print(f"  {out[:200]}")

# Also add for preview and development
for key, value in env_vars.items():
    for env in ["preview", "development"]:
        subprocess.run(
            f'echo {value} | npx vercel env add {key} {env}',
            capture_output=True,
            text=True,
            cwd=PROJECT_DIR,
            shell=True
        )

print("\nAll env vars set. Now deploying...")

# Deploy with --prod
result = subprocess.run(
    'npx vercel deploy --prod --yes',
    capture_output=True,
    text=True,
    cwd=PROJECT_DIR,
    shell=True
)
print(result.stdout[-2000:] if len(result.stdout) > 2000 else result.stdout)
if result.stderr:
    print(result.stderr[-2000:] if len(result.stderr) > 2000 else result.stderr)
print(f"\nExit code: {result.returncode}")
