#!/bin/bash

# Load environment variables
set -a
source .env
# Load production-specific environment variables (overrides base .env)
if [ -f ".env.production" ]; then
  source .env.production
  echo "✅ Loaded .env.production"
else
  echo "⚠️  .env.production not found, using only .env"
fi
set +a

# Ensure IMAGE_TAG is set
if [ -z "$IMAGE_TAG" ]; then
  echo "IMAGE_TAG is not set. Attempting to fetch the latest image tag from Artifact Registry..."

  IMAGE_TAG=$(gcloud container images list-tags $REGION-docker.pkg.dev/$PROJECT_ID/$APP_NAME/$APP_NAME \
    --filter="tags:*" \
    --sort-by=~TAGS \
    --limit=1 \
    --format="value(tags)")

  if [ -z "$IMAGE_TAG" ]; then
    echo "❌ Failed to fetch the latest image tag. Exiting."
    exit 1
  else
    IMAGE_TAG=$(basename "$IMAGE_TAG")
    export IMAGE_TAG
    echo "✅ Fetched latest IMAGE_TAG: $IMAGE_TAG"
    read -p "Is the IMAGE_TAG correct? [y/n]: $IMAGE_TAG — Please confirm: " CONFIRMATION
    if [[ "$CONFIRMATION" =~ ^[Yy]$ ]]; then
      echo "✅ Proceeding with IMAGE_TAG: $IMAGE_TAG"
    else
      echo "❌ IMAGE_TAG not confirmed. Exiting."
      exit 1
    fi
  fi
fi

echo "🔐 Fetching Cloudflare Tunnel token from Secret Manager..."
TUNNEL_TOKEN=$(gcloud secrets versions access latest --secret="cloudflare-tunnel-token-$APP_NAME" --project="$PROJECT_ID")

if [ -z "$TUNNEL_TOKEN" ]; then
  echo "❌ Failed to retrieve tunnel token. Exiting."
  exit 1
fi

export TUNNEL_TOKEN

echo "🔐 Fetching next server actions key from Secret Manager..."
SERVER_ACTIONS_KEY_B64=$(gcloud secrets versions access latest --secret="next-server-actions-key" --project="$PROJECT_ID")

if [ -z "$SERVER_ACTIONS_KEY_B64" ]; then
  echo "❌ Failed to retrieve next server actions key. Exiting."
  exit 1
fi

export SERVER_ACTIONS_KEY_B64

envsubst < kubernetes/production.yaml | kubectl apply -f -
