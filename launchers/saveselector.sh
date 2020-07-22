#!/bin/bash
is_num() { [ "$1" ] && [ -z "${1//[0-9]}" ] ;}

a="Save Group 1\nSave Group 2\nSave Group 3\nSave Group 4\n"
b="Restore Group 1\nRestore Group 2\nRestore Group 3\nRestore Group 4\n"
c="${a}${b}"

ans=$(echo -e "$c" | rofi -dmenu -width 10 -lines 8)

if [[ $ans == *"Save"* ]]; then
  num=$(echo "$ans" | sed "s/Save Group //")
  cmd="node /home/yo/code/grop/grop.js save g${num}"
else
  num=$(echo "$ans" | sed "s/Restore Group //")
  cmd="node /home/yo/code/grop/grop.js restore g${num}"
fi

if is_num "$num"; then
  eval $cmd
fi