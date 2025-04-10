# End to End Encrypted messages

## Run using docker-compose

WARNING: the default docker-compose.yaml is for dev only, you should use the `docker-compose.prod.yaml` to test the website in its "production" build.

By default it downloads a prebuilt image to avoid the need for building which can take some time (rust is involved).

```bash
docker compose -f docker-compose.prod.yaml up -d # Add `--build` to force rebuilding it
```

The site should be available on `http://localhost:3000`.

## Compiling the project

### Frontend

Requirements:

- Node.js (v23 should work with v20 as well)
- Rust (v1.85)
  - Install rust with rustup: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
  - Install the `wasm32-unknown-unknown` target with `rustup target add wasm32-unknown-unknown`
  - Install `wasm-pack` with `cargo install wasm-pack`

Run the frontend:

```bash
cd frontend

# Compile argon2wasm (a precompiled output is included in the repo to avoid the need for touching Rust)
cd argon2wasm
npm run argon2wasm # Run on each update to the argon2wasm module

# Install dependencies for the frontend
npm install

# Run the frontend
npm run start

# Or build it for production
npm run build
```

Beware, frontend types are automatically generated from the backend types on startup. They are not autoreloaded. When you modify a type on the backend, you should restart your frontend.

### Backend

Requirements:

- python3.12
- pip
- venv

Run the backend:

```bash
# Start required services
docker compose up -d

cd backend

# Create and enter virtual env
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
python3 -m pip install -r ./requirements.txt

# Run the frontend
python3 -m main --reload
```
