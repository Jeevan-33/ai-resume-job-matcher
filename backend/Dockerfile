# Use an official Python runtime as a parent image
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .
RUN chmod +x start.sh

# Defaults so the image boots even without a bundled .env
# (docker-compose / Render override DATABASE_URL and SECRET_KEY)
ENV PROJECT_NAME="AI Resume Job Matching API"
ENV ENVIRONMENT="development"

# Expose the port FastAPI runs on (Render supplies its own $PORT at runtime)
EXPOSE 8000

# Apply migrations, then start the API. $PORT is set by Render; falls back
# to 8000 for docker-compose / local runs.
CMD ["./start.sh"]