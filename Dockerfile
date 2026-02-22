FROM python:3.10-slim

WORKDIR /app

# Copy requirements first — this layer is cached by Docker (and Render)
# unless requirements.txt changes, so pip install is skipped on source-only deploys
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code (this layer rebuilds on any source change, but it's fast)
COPY main.py .
COPY dummy_data/ dummy_data/

EXPOSE 10000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
