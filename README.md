# End to End Encrypted messages

## Compiling the project

### Frontend

Requirements:

- Node.js (v23 should work with v20 as well)
- (optional) Rust (v1.85)
  - Install with `rustup` and add the `wasm32-unknown-unknown` target with `rustup target add wasm32-unknown-unknown`
  - Install `wasm-pack` with `cargo install wasm-pack`

Run the frontend:

```bash
cd frontend

# (Optional) Compile argon2wasm (a precompiled output is included in the repo to avoid the need for touching Rust)
cd argon2wasm
wasm-pack build --target web
cd ..

# Install dependencies for the frontend
npm install

# Run the frontend
npm run start

# Or build it for production
npm run build
```

### Backend

Requirements:

- python3.12
- pip
- venv

Run the backend:

```bash
cd backend

# Create and enter virtual env
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
python3 -m pip install -r ./requirements.txt

# Run the frontend
python3 -m main --reload
```
