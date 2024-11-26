#!/bin/bash

echo "等待MongoDB服务启动..."
sleep 30

# 初始化配置服务器副本集
echo "初始化配置服务器副本集..."
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

echo "等待配置服务器副本集初始化..."
sleep 20

# 初始化分片副本集
echo "初始化分片副本集..."
docker exec shard1svr1 mongosh --port 27018 --eval '
rs.initiate({
  _id: "shard1rs",
  members: [
    { _id: 0, host: "shard1svr1:27018" },
    { _id: 1, host: "shard1svr2:27018" },
    { _id: 2, host: "shard1svr3:27018" }
  ]
})'

echo "等待分片副本集初始化..."
sleep 20

# 添加分片到集群
echo "添加分片到集群..."
docker exec mongos1 mongosh --eval '
sh.addShard("shard1rs/shard1svr1:27018,shard1svr2:27018,shard1svr3:27018")
'

# 为todo_app启用分片
echo "为todo_app数据库启用分片..."
docker exec mongos1 mongosh --eval '
use todo_app
sh.enableSharding("todo_app")
'

echo "MongoDB分片集群初始化完成！"