#!/bin/bash
cd "D:\Projetos Antigravity\SPFP\SPFP"
npm run test -- --run 2>&1 | tail -50
