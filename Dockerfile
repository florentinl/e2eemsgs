FROM rust AS agepy_builder
WORKDIR /app

# Install maturin
RUN apt update && apt install pipx -y
RUN pipx install maturin

COPY backend/agepy .
RUN pipx run maturin build --release -i python3.12

FROM python:3.12-slim AS backend_builder
WORKDIR /app

COPY backend/requirements.txt .

RUN tail -n +2 requirements.txt > requirements_.txt
RUN pip install -r requirements_.txt
COPY --from=agepy_builder /app/target/wheels/agepy-0.1.0-cp312-cp312-manylinux_2_34_*.whl /tmp
RUN pip install /tmp/*.whl

COPY backend .
RUN python main.py --openapi

FROM rust AS argon2wasm_builder
WORKDIR /app

# Install wasm-pack
RUN rustup target add wasm32-unknown-unknown
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

COPY frontend/argon2wasm .

RUN wasm-pack build --target web


FROM node:23 AS frontend_builder
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend .
COPY --from=argon2wasm_builder /app/pkg argon2wasm/pkg

COPY --from=backend_builder /app/openapi.json /backend/openapi.json

RUN npm run openapi-codegen
RUN npm run build

FROM backend_builder AS final
ENV ENVIRONMENT=prod

COPY --from=frontend_builder /app/dist ./dist
ENTRYPOINT ["python","main.py"]
