# Deploy on Ubuntu EC2 with Docker and HTTPS

This is the direct Docker deployment path for one Ubuntu EC2 instance. It does
not use the ECS resources in `deploy/ecs-ec2-ubuntu.yaml`.

## 1. Launch the EC2 instance

Create an EC2 instance with these settings:

- **AMI:** Ubuntu Server 24.04 LTS, 64-bit x86.
- **Instance type:** `t3.small` is recommended for building and running this
  Next.js container.
- **Storage:** 20–30 GB gp3.
- **Network:** public subnet with a public IPv4 address. Associate an Elastic
  IP before configuring a production domain.
- **Key pair:** create and download an EC2 SSH key pair.

Configure the instance security group:

| Rule | Port | Source |
| --- | ---: | --- |
| SSH | 22 | Your public IP only |
| HTTP | 80 | `0.0.0.0/0` |
| HTTPS | 443 | `0.0.0.0/0` |

Do not expose application port `3000` to the internet. Caddy publishes ports
80 and 443 and forwards traffic to the application inside Docker.

## 2. Connect to the instance

From PowerShell on the local machine:

```powershell
ssh -i "$HOME\Downloads\your-key.pem" ubuntu@<EC2_PUBLIC_IP_OR_DNS>
```

The default username for the Ubuntu EC2 image is `ubuntu`.

## 3. Install Docker Engine and Git

Run the following on the EC2 instance:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl git

sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
exit
```

Reconnect over SSH, then verify Docker:

```bash
docker version
docker compose version
docker run --rm hello-world
```

## 4. Clone the correct Git branch

If the branch containing the Dockerfile is not the default branch, clone it
directly:

```bash
git clone --branch <branch-name> --single-branch \
  https://github.com/ESubrado/LocaleBreezeStore.git \
  /opt/locale-breeze-store
```

To switch an existing clone to that branch:

```bash
cd /opt/locale-breeze-store
git fetch origin
git branch -r
git switch --track origin/<branch-name>
git pull --ff-only
```

Confirm the Dockerfile exists before building:

```bash
cd /opt/locale-breeze-store/client
git branch --show-current
ls -l Dockerfile
```

`Dockerfile` is case-sensitive on Ubuntu. If it is absent, the checked-out
branch does not contain it, or it uses a different filename. Locate an
alternative with:

```bash
find . -maxdepth 2 -iname 'dockerfile*'
```

## 5. Create the production environment file

From `/opt/locale-breeze-store/client`, create a file that includes only the
browser-safe Supabase configuration:

```bash
nano .env.production
```

Add the values from the Supabase project:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_or_legacy_anon_key
NEXT_PUBLIC_SUPABASE_DEBUG=false
```

Then protect the file:

```bash
chmod 600 .env.production
```

Never put a Supabase `service_role` key, database password, or other privileged
secret in this file. The app requires a browser-safe publishable or legacy anon
key.

## 6. Build the application image

The Dockerfile requires the `NEXT_PUBLIC_*` values as build arguments. Runtime
environment values alone are insufficient because Next.js compiles public
variables into the client bundle.

```bash
cd /opt/locale-breeze-store/client

set -a
source ./.env.production
set +a

TAG=$(git rev-parse --short HEAD)

docker build --pull \
  --build-arg NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
  --build-arg NEXT_PUBLIC_SUPABASE_DEBUG \
  -t "locale-breeze-client:$TAG" \
  -t "locale-breeze-client:current" \
  .
```

If `docker build` reports `failed to read dockerfile: open Dockerfile: no such
file or directory`, run `ls -la` and check the branch and filename in step 4.

## 7. Run the application through Caddy

Create the private Docker network once:

```bash
docker network create locale-breeze-net
```

Start the app. It has no public port mapping because Caddy will reach it using
the `locale-breeze-net` Docker network:

```bash
docker rm -f locale-breeze-client 2>/dev/null || true

docker run -d \
  --name locale-breeze-client \
  --restart unless-stopped \
  --init \
  --network locale-breeze-net \
  --env-file ./.env.production \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  -e NEXT_TELEMETRY_DISABLED=1 \
  locale-breeze-client:current
```

## 8. Configure HTTPS with Caddy

Before starting Caddy:

1. Associate an Elastic IP with the EC2 instance.
2. Create an `A` record for the production domain that points to that Elastic
   IP, for example `example.com` → `<ELASTIC_IP>`.
3. Confirm the EC2 security group allows public inbound TCP ports 80 and 443.

Create Caddy's configuration:

```bash
mkdir -p /opt/locale-breeze-store/caddy
cd /opt/locale-breeze-store/caddy
nano Caddyfile
```

Replace `example.com` with the real domain:

```caddy
example.com {
    reverse_proxy locale-breeze-client:3000
}
```

Start Caddy:

```bash
docker run -d \
  --name caddy \
  --restart unless-stopped \
  --network locale-breeze-net \
  -p 80:80 \
  -p 443:443 \
  -v "$PWD/Caddyfile:/etc/caddy/Caddyfile:ro" \
  -v caddy_data:/data \
  -v caddy_config:/config \
  caddy:2-alpine
```

Caddy obtains and renews public TLS certificates automatically, then redirects
HTTP to HTTPS. Do not delete the `caddy_data` volume; it stores certificates
and certificate-management state.

## 9. Verify the deployment

On EC2, check that both containers are running:

```bash
docker ps
```

Inspect logs if a container exits or the site does not load:

```bash
docker logs --tail 100 locale-breeze-client
docker logs --tail 100 caddy
```

Test the application through Caddy:

```bash
curl -IL http://example.com
curl -I https://example.com
```

`http://example.com` should redirect to HTTPS. Then open
`https://example.com` in a browser.

## 10. Deploy a later version

```bash
cd /opt/locale-breeze-store
git pull --ff-only

cd client
set -a
source ./.env.production
set +a

TAG=$(git rev-parse --short HEAD)

docker build --pull \
  --build-arg NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY \
  --build-arg NEXT_PUBLIC_SUPABASE_DEBUG \
  -t "locale-breeze-client:$TAG" \
  -t "locale-breeze-client:current" \
  .

docker rm -f locale-breeze-client

docker run -d \
  --name locale-breeze-client \
  --restart unless-stopped \
  --init \
  --network locale-breeze-net \
  --env-file ./.env.production \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  -e NEXT_TELEMETRY_DISABLED=1 \
  locale-breeze-client:current

docker image prune -f
```

This replacement causes a brief interruption. For zero-downtime deployments
or multi-instance availability, use an ALB and an orchestrator such as ECS.
