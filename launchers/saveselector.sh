#!/bin/bash
is_num() { [ "$1" ] && [ -z "${1//[0-9]}" ] ;}

open="Open Group 1\nOpen Group 2\nOpen Group 3\nOpen Group 4\n"
save="\nSave Group 1\nSave Group 2\nSave Group 3\nSave Group 4\n"
c="${open}${save}"

ans=$(echo -e "$c" | rofi -dmenu -width 10 -lines 9 -me-select-entry '' -me-accept-entry 'MousePrimary' -font 'hack 18' -location 2 -yoffset 740)

if [[ $ans == *"Save"* ]]; then
  num=$(echo "$ans" | sed "s/Save Group //")
  cmd="node /home/yo/code/grop/grop.js save g${num}"
else
  num=$(echo "$ans" | sed "s/Open Group //")
  cmd="node /home/yo/code/grop/grop.js restore g${num}"
fi

if is_num "$num"; then
  eval $cmd
fi