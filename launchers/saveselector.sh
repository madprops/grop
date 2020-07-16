#!/bin/bash
is_num() { [ "$1" ] && [ -z "${1//[0-9]}" ] ;}

output=$(echo -e "Save Group 1\nSave Group 2\nSave Group 3\nSave Group 4\n" | rofi -dmenu -width 8 -lines 4)
num=$(echo "$output" | sed "s/Save Group //")

if is_num "$num"; then
  cmd="node /home/yo/code/grop/grop.js save g${num}"
  eval $cmd
fi