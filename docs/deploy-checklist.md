# Deploy Checklist — Voca Auth

> Region: **asia-southeast1** · Platform: **Google Cloud Run** · CI: **GitHub Actions**
> 
> Full technical runbook → [`docs/deployment.md`](./deployment.md)

---

## One-Time Setup (do this once before first deploy)

### Step 1 — GCP Bootstrap

Replace `<PROJECT_ID>` with your GCP project ID throughout.

```bash
# Authenticate
gcloud auth login
gcloud config set project <PROJECT_ID>

# Enable required GCP APIs
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  sqladmin.googleapis.com \
  pubsub.googleapis.com \
  cloudbuild.googleapis.com

# Create Artifact Registry repo
gcloud artifacts repositories create voca-auth \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="Voca Auth container images"
```

### Step 2 — Cloud SQL (PostgreSQL)

```bash
gcloud sql instances create voca-auth-db \
  --database-version=POSTGRES_15 \
  --region=asia-southeast1 \
  --tier=db-f1-micro

gcloud sql databases create voca_auth --instance=voca-auth-db
gcloud sql users set-password postgres --instance=voca-auth-db --prompt-for-password
```

### Step 3 — Store Secrets in Secret Manager

```bash
# Run each of these and paste the value when prompted
# (or pipe with: echo -n "value" | gcloud secrets create NAME --data-file=-)

gcloud secrets create DATABASE_URL          --replication-policy=automatic
gcloud secrets create FIREBASE_PROJECT_ID   --replication-policy=automatic
gcloud secrets create FIREBASE_CLIENT_EMAIL --replication-policy=automatic
gcloud secrets create FIREBASE_PRIVATE_KEY  --replication-policy=automatic
gcloud secrets create JWT_SECRET            --replication-policy=automatic
```

Paste values:
- `DATABASE_URL` → `postgres://USER:PASS@HOST/voca_auth` (from Cloud SQL)
- `FIREBASE_PROJECT_ID` → from Firebase Console
- `FIREBASE_CLIENT_EMAIL` → Firebase Admin SDK service account email
- `FIREBASE_PRIVATE_KEY` → Firebase Admin SDK private key (include `-----BEGIN/END PRIVATE KEY-----`)
- `JWT_SECRET` → run `openssl rand -hex 64` to generate

### Step 4 — Create a GCP Service Account for GitHub Actions

```bash
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions — Voca Auth CI/CD"

SA="github-actions@<PROJECT_ID>.iam.gserviceaccount.com"

# Grant minimum required roles
gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:$SA" --role="roles/run.admin"
gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:$SA" --role="roles/artifactregistry.writer"
gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:$SA" --role="roles/secretmanager.secretAccessor"
gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:$SA" --role="roles/cloudsql.client"
gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:$SA" --role="roles/iam.serviceAccountUser"

# Export key for GitHub
gcloud iam service-accounts keys create gcp-sa-key.json --iam-account=$SA
```

### Step 5 — Add GitHub Secrets

In your GitHub repository → **Settings → Secrets and variables → Actions**, add:

| Secret name                              | Value                                      |
|------------------------------------------|--------------------------------------------|
| `GCP_PROJECT_ID`                         | Your GCP project ID                        |
| `GCP_SA_KEY`                             | Contents of `gcp-sa-key.json` (delete file after) |
| `NEXT_PUBLIC_FIREBASE_API_KEY`           | Firebase Web API key                       |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`       | `<project>.firebaseapp.com`                |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`    | `<project>.appspot.com`                    |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID                       |
| `NEXT_PUBLIC_FIREBASE_APP_ID`            | Firebase App ID                            |

> [!CAUTION]
> Delete `gcp-sa-key.json` from your local machine after uploading to GitHub Secrets.

---

## Every Deploy (automated via GitHub Actions)

Merging to `main` automatically triggers the 4-job pipeline:

```
test → build-and-push → migrate → deploy
```

**Pipeline file:** [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

To trigger manually:
```bash
gh workflow run deploy.yml
```

---

## Manual Deploy (skip CI)

If you need to deploy directly without GitHub Actions:

```bash
PROJECT_ID=<PROJECT_ID>
VERSION=$(git rev-parse --short HEAD)
IMAGE="asia-southeast1-docker.pkg.dev/$PROJECT_ID/voca-auth/app:$VERSION"

# 1. Authenticate
gcloud auth configure-docker asia-southeast1-docker.pkg.dev

# 2. Build
docker build -t $IMAGE .

# 3. Push
docker push $IMAGE

# 4. Migrate (BEFORE deploy)
DATABASE_URL="$(gcloud secrets versions access latest --secret=DATABASE_URL)" \
  pnpm drizzle-kit migrate

# 5. Deploy
gcloud run deploy voca-auth \
  --image $IMAGE \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --min-instances 0 \
  --max-instances 10 \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,FIREBASE_PROJECT_ID=FIREBASE_PROJECT_ID:latest,FIREBASE_CLIENT_EMAIL=FIREBASE_CLIENT_EMAIL:latest,FIREBASE_PRIVATE_KEY=FIREBASE_PRIVATE_KEY:latest,JWT_SECRET=JWT_SECRET:latest" \
  --set-env-vars "ROOT_DOMAIN=voca.com,AUTH_PORTAL_URL=https://auth.voca.com,COOKIE_DOMAIN=.voca.com"
```

---

## Post-Deploy Checklist

- [ ] Cloud Run revision serving traffic (`gcloud run services describe voca-auth --region=asia-southeast1`)
- [ ] Health check: `GET https://auth.voca.com/api/health → 200`
- [ ] SSO login flow completes end-to-end
- [ ] Wildcard cookie: `HttpOnly; Secure; SameSite=Lax; Domain=.voca.com`
- [ ] Edge Middleware rejects cross-tenant session
- [ ] Pub/Sub `TenantCreated` event visible in GCP Console

---

## Rollback

```bash
# List revisions
gcloud run revisions list --service=voca-auth --region=asia-southeast1

# Instantly route 100% traffic to a previous stable revision
gcloud run services update-traffic voca-auth \
  --region asia-southeast1 \
  --to-revisions=<PREVIOUS_REVISION>=100
```

---

*Last updated: 2026-04-04 · Region: asia-southeast1*
