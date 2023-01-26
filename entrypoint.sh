#!/bin/sh

while :
do
  node index.js || true

  # wait 10 minutes
  sleep 600
done