FROM rust AS agepy_builder
WORKDIR /app

# Install maturin
RUN cargo install maturin

COPY backend/agepy .
RUN maturin build --release -i python3.12

FROM python:3.12-slim AS backend_builder
WORKDIR /app

COPY backend .

RUN tail -n +2 requirements.txt > requirements_.txt
RUN pip install -r requirements_.txt
COPY --from=agepy_builder /app/target/wheels/agepy-0.1.0-cp312-cp312-manylinux_2_34_x86_64.whl /tmp
RUN pip install /tmp/*.whl
RUN python main.py --openapi

FROM rust AS argon2wasm_builder
WORKDIR /app

# Install wasm-pack
RUN rustup target add wasm32-unknown-unknown
RUN cargo install wasm-pack

COPY frontend/argon2wasm .

RUN wasm-pack build --target web


FROM node:23 AS frontend_builder
WORKDIR /app

COPY frontend .
COPY --from=argon2wasm_builder /app/pkg argon2wasm/pkg

COPY --from=backend_builder /app/openapi.json /backend/openapi.json

RUN npm install
RUN npm run openapi-codegen
RUN npm run build

FROM backend_builder AS final
ENV ENVIRONMENT=prod

COPY --from=frontend_builder /app/dist ./dist
ENTRYPOINT ["python","main.py"]
