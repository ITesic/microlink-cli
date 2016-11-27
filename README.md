# Microlink utilities

Unofficial utilities application for managing memory drive of [MICROLINK](http://www.microlink.rs) CD changer emulator.

MICROLINK is a device which existing factory radio unit in the car adds the ability to connect USB memory, MicroSD cards, mobile phones and various MP3 players. Connected memory need to have certain file structure so MICROLINK can recognize it.

Microlink-cli app is used for preparing Microlink drive and managing it's content. It also adds some functionalities that some cars don't have, like Shuffle.

## Installation

Microlink-cli can be installed using npm command

`npm install microlink-cli -g`

## Commands

All commands require `path` param which is the root of the Microlink drive. If `path` is not present app will use `.` as default path.

### init

`microlink init [path]`

Initialize Microlink drive in selected path.

`microlink init [path] -n <int>`

Parameter `-n <int>` sets number of drives that will be created, in range 1..10.

### info

`microlink info [path]`

Show info about Microlink drive and it's content.

### shuffle

`microlink shuffle [path]`

Shuffle files in all discs on Microlink drive.

`microlink shuffle [path] -r`

Reverse files in original order.

`microlink shuffle [path] -d <int>`

Shuffle files in selected disc. Parameter `-d <int>` is the number of the disc which will be mixed.

### balance

`microlink balance [path]`

Maximum number of files in one disc is 99. If there are more files MICROLINK will ignore them. This command moves ignored songs to another discs so most of them can be accessed.

_This command is in progress._

### collection

Create multiple collections on one drive, and use them as needed.

_This command is in progress._
