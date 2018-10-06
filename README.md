# hots-caster-tool

A tool for generating OBS overlays for casting Heroes of the Storm.
Inspired by the [StarCraft Casting Tool](https://github.com/teampheenix/StarCraft-Casting-Tool)

## Usage

Currently in development. There is no dist for the project yet.

### Available Overlays

Overlays should be added to OBS as a Browser Source using the Local File option
and no custom CSS. They are found in `src/obs_src`. All of the files in the root
of this directory should be treated as the demo files. You'll likely want to either
find a theme for your overlays or make your own theme (theming guide coming soon).

If you are using team logos, make sure they are on the same disk partition. OBS does not
like the `file:///` protocol so the tool uses relative paths that only resolve if they're on the same partition.

* `in-game.html` - An in-game HUD displaying team names and the current match score.
* `blue-team-logo.html` - Auto-sized blue team logo.
* `red-team-logo.html` - Auto-sized red team logo.

## Developing

This should get you started:
```
git clone
yarn install
yarn start
```

If you don't want to use yarn, npm should work just fine.
New overlays should be placed in `src/obs_src`. See the existing overlays for examples.
Semantic-ui and jQuery are available in both the controller and the overlays.

### Roadmap
* Implement full in-game HUD (with map selections, series count, etc)
* Implement map selection overlays
* Implement caster utility overlays (backgrounds, frames, scoreboards, etc)
* Investigate integration with other hots apps (specifically stats of the storm)
* Themes