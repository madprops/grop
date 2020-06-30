## Intended Usage

- Trigger the interactive mode with the 'save' command
- Point each window you want to save and hit Ctrl within 5 seconds
- When you want to restore that group trigger the 'restore' command
- Save and Restore commands should be programmed to keyboard shortcuts
- This is a way to simulate workspaces inside the same workspace

## About

I made this for KDE Plasma since there are no independent workspaces per monitor.

This allows for different window combinations in the same workspace.

This uses window ids so it can work with multiple instances of a program.

This means the groups will need to be created everytime the windows start.

There's an xbindkeys file with shortcuts that can be used with a numpad.

## Information Saved

 - Window ID
 - Window Width
 - Window Height
 - Window X Position
 - Window Y Position

## Usage
>grop save mygroup1

Start interactive mode
>grop restore mygroup1

Restore group windows

## Info

- Interactive mode = point and press Ctrl on windows to save them

- Interactive mode lasts 5 seconds before it exits

- Escape aborts the save operation and exits interactive mode

- Group window information is saved to files like ~/.config/grop/mygroup1