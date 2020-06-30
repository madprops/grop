## Intended Usage

- Trigger the interactive mode with the 'save' command
- Point to each window you want to save with the mouse cursor and hit Ctrl within 5 seconds
- When you want to restore that group trigger the 'restore' command
- Save and Restore commands should be programmed to keyboard shortcuts
- This is a way to simulate workspaces inside the same workspace

>grop save mygroup1

Start interactive mode for mygroup1

Saved in ~/.config/grop/mygroup1

>grop restore mygroup1

Restore group windows of mygroup1

Properties read from ~/.config/grop/mygroup1

>grop swap mygroup1

Interactive mode to swap two windows from a group

Same point and Ctrl mechanic

This is still experimental

## About

I made this for KDE Plasma since there are no independent workspaces per monitor.

This allows for different window combinations in the same workspace.

This uses window ids so it can work with multiple instances of a program.

This means the groups will need to be created everytime the windows start.

There's an xbindkeys file with shortcuts that can be used with a numpad.

Escape cancels the save operation while on interactive mode.

## Information Saved

 - Window ID
 - Window Width
 - Window Height
 - Window X Position
 - Window Y Position

https://i.imgur.com/eVQrm1m.gif