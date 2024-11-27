#!/bin/bash

echo "Waiting for MongoDB service to start..."
sleep 30

# Initialize config server replica set
echo "Initializing config server replica set..."
docker exec cfgsvr1 mongosh --port 27019 --eval '
rs.initiate({
  _id: "cfgrs",
  configsvr: true,
  members: [
    { _id: 0, host: "cfgsvr1:27019" },
    { _id: 1, host: "cfgsvr2:27019" },
    { _id: 2, host: "cfgsvr3:27019" }
  ]
})'

echo "Waiting for config server replica set initialization..."
sleep 20

# Initialize shard replica set
echo "Initializing shard replica set..."
docker exec shard1svr1 mongosh --port 27018 --eval '
rs.initiate({
  _id: "shard1rs",
  members: [
    { _id: 0, host: "shard1svr1:27018" },
    { _id: 1, host: "shard1svr2:27018" },
    { _id: 2, host: "shard1svr3:27018" }
  ]
})'

echo "Waiting for shard replica set initialization..."
sleep 20

# Add shard to cluster
echo "Adding shard to cluster..."
docker exec mongos1 mongosh --eval '
sh.addShard("shard1rs/shard1svr1:27018,shard1svr2:27018,shard1svr3:27018")
'

# Enable sharding for todo_app
echo "Enabling sharding for todo_app database..."
docker exec mongos1 mongosh --eval '
use todo_app
sh.enableSharding("todo_app")
'

echo "MongoDB sharded cluster initialization completed!"