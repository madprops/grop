#!/bin/bash
output=$(echo -e "Save Group 1\nSave Group 2\nSave Group 3\nSave Group 4\n" | rofi -dmenu -width 8 -lines 4)
num=$(echo "$output" | sed "s/Save Group //")
cmd="node /home/yo/code/grop/grop.js save g${num}"
eval $cmd