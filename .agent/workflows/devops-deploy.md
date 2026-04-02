---
description: DevOps — Build and deploy voca-auth to Google Cloud Run
---

## DevOps Deploy Workflow

Use this workflow for every production or staging deployment of `voca-auth`.

### Pre-Deploy Checklist

- [ ] All PRs in the release have `[status: done]` and `[security: approved]`
- [ ] `pnpm test` passes on the target branch
- [ ] Environment variables are up to date in GCP Secret Manager
- [ ] DB migrations (if any) have been reviewed by Architect

### 1. Build the Container Image

```bash
# Authenticate to Google Artifact Registry
gcloud auth configure-docker <REGION>-docker.pkg.dev

# Build and tag the image
docker build -t <REGION>-docker.pkg.dev/<PROJECT_ID>/voca-auth/app:<VERSION> .

# Push to Artifact Registry
docker push <REGION>-docker.pkg.dev/<PROJECT_ID>/voca-auth/app:<VERSION>
```

### 2. Run DB Migrations (if applicable)

```bash
# Run Drizzle migrations against Cloud SQL
pnpm drizzle-kit migrate
```

> ⚠️ Always run migrations BEFORE deploying the new container image.

### 3. Deploy to Cloud Run

```bash
gcloud run deploy voca-auth \
  --image <REGION>-docker.pkg.dev/<PROJECT_ID>/voca-auth/app:<VERSION> \
  --region <REGION> \
  --platform managed \
  --allow-unauthenticated \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,FIREBASE_ADMIN_KEY=FIREBASE_ADMIN_KEY:latest,JWT_SECRET=JWT_SECRET:latest"
```

### 4. Post-Deploy Verification

- [ ] Cloud Run revision is serving traffic (check GCP Console → Cloud Run → Revisions)
- [ ] Health check endpoint responds: `GET /api/health → 200 OK`
- [ ] Test SSO login flow in the deployed environment end-to-end
- [ ] Verify wildcard cookie `Domain` matches the production domain
- [ ] Check Cloud Run logs for startup errors

### 5. Rollback (if needed)

```bash
# Route traffic back to the previous stable revision
gcloud run services update-traffic voca-auth \
  --to-revisions=<PREVIOUS_REVISION>=100
```

### 6. Notify

- Tag the release in git: `git tag v<VERSION> && git push --tags`
- Notify PM that the deployment is live
