# Development database options

The API supports both local MongoDB and MongoDB Atlas through `MONGODB_URI`.
Neither service is running or provisioned by this setup. An empty URI allows the
API to start for development, but `/api/v1/ready` returns HTTP 503.

## Option A: local MongoDB

Docker is not installed on this Mac yet. After installing Docker from its official
source, run these commands from the repository root:

```sh
docker compose -f infrastructure/compose.yaml up -d
```

In `server/.env`, set:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB_NAME=make_my_marriage_dev
```

Restart the API and check readiness. To stop the database without deleting its
stored data:

```sh
docker compose -f infrastructure/compose.yaml down
```

The compose service uses the Docker Official Image `mongo:8.0`, a Docker-managed
data volume, and a port bound only to this laptop. It has no authentication and is
for local development only. The compose recipe has not been run because Docker is
unavailable. Before features use MongoDB transactions, extend local development
to a replica set and add integration checks; this starter is a standalone database.

## Option B: MongoDB Atlas

When you choose hosted development, create your own Atlas account/project and
select an appropriate cluster. Check the current free-tier availability and
pricing before provisioning. Create a database user limited to the development
database, allow your laptop's IP address, and copy the Node.js driver connection
string into `server/.env` only:

```dotenv
MONGODB_URI=mongodb+srv://<user>:<encoded-password>@<cluster-host>/?retryWrites=true&w=majority
MONGODB_DB_NAME=make_my_marriage_dev
```

Replace the placeholders. Atlas connection strings commonly require
percent-encoding special characters in the password. Avoid an unrestricted IP
allowlist. Separate development, staging, and production databases later.

## Check the selected option

After restarting the API:

```sh
curl http://127.0.0.1:4000/api/v1/health
curl -i http://127.0.0.1:4000/api/v1/ready
```

Health returns HTTP 200 when the process works. Readiness returns HTTP 200 only
after a successful database ping, and HTTP 503 if the database is missing or
unreachable. No collections, credentials, cloud resources, or wedding data are
created by the readiness check.

References:

- [MongoDB Node.js connection guidance](https://www.mongodb.com/docs/drivers/node/current/connect/mongoclient/)
- [Docker Official Image for MongoDB](https://hub.docker.com/_/mongo)
- [Atlas getting started](https://www.mongodb.com/docs/atlas/getting-started/)
