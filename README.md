# Falindrith's Caster Tool

A tool for generating OBS overlays for casting various video games.
Inspired by the [StarCraft Casting Tool](https://github.com/teampheenix/StarCraft-Casting-Tool).

Like the project? There's a tip jar over at Ko-Fi:

[![ko-fi](https://www.ko-fi.com/img/donate_sm.png)](https://ko-fi.com/E1E2KHZ3)

## Usage

Download zip from releases, extract to folder with read/write access (Movies, My Documents, etc.).
Placing in Program Files will restrict what the app can do (text files won't be written).

### Supported Games

Different games have different overlay support. The tool was initially developed
to only support Heroes of the Storm casts, so some files that have no prefix are
specific to hots (`map-select.html` for instance). Post `v1.1.0`, game-speciifc `obs-src` html files
will be marked with a game prefix to indicate where they should be used.

* Heroes of the Storm
  * Supported overlays: all
* Super Smash Bros Ultimate
  * Supported overlays: `in-game`, `caster-frame`, `caster-single-frame`, `blue-team-logo`, `red-team-logo`

### Available Overlays

Overlays should be added to OBS as a Browser Source using the Local File option
and no custom CSS. Use the recommended resolutions as the browser source size.
If no resolution is listed, use any size that satisfies the given aspect ratio.
They are found in `src/obs_src`. All of the files in the root
of this directory should be treated as the demo files. You'll likely want to either
find a theme for your overlays or make your own theme (theming guide coming soon).

If you are using team logos, make sure they are on the same disk partition. OBS does not
like the `file:///` protocol so the tool uses relative paths that only resolve if they're on the same partition.

* `in-game.html`
  * An in-game HUD displaying team names and the current match score.
  * Required Resolution: 1920 x 1080
* `blue-team-logo.html`
  * Auto-sized blue team logo.
  * Required Resolution: none, 1:1 aspect ratio suggested
* `red-team-logo.html`
  * Auto-sized red team logo.
  * Required Resolution: none, 1:1 aspect ratio suggested
* `draft.html`
  * In-draft HUD displaying team names and current match score
  * Required Resolution: 1920 x 1080
* `map-select.html`
  * Map selection, bans, and results summary screen
  * Required Resolution: 1929 x 1080
* `map-select-tiles.html`
  * The tiles from `map-select.html` by themselves
  * Required Resolution: none
* `map-select-list.html`
  * The map pick list from `map-select.html` by itself.
  * Required Resolution: none
* `caster-frame.html`
  * Caster frame. Changes layout based on number of casters set in the app.
  * Required Resolution: 1920 x 1080
* `caster-single-frame.html`
  * Caster frame (for webcams). Default file is not recommended for use, as it is partially styled
  * Required Resolution: 1920 x 1080
* `caster-single-side-facts.html`
  * No Default Style
  * Intended use: caster frame with sidebox for facts/text
  * Required Resolution: 1920 x 1080
* `caster-duo-frame.html`
  * No Default Style
  * Intended use: two casters
  * Required Resolution: 1920 x 1080
* `post-game.html`
  * No Default Style
  * Required Resolution: 1920 x 1080
* `stat-lower-third.html`
  * Base style is for demo only; you'll want to theme this for actual use.
  * Displays stats in a lower third. Must have a connected Stat Source to use.
  * Required Resolution: 1920 x 1080
* `player-popups.html`
  * Base style is for demo only; you'll want to theme this for actual use.
  * Displays a popup containing player name, hero, and hero portrait.
  * Display mode controlled by options in-app

## Theming

Themes can be added to the `src/obs_src/themes` folder. Themes require a `theme.json` file with the
following fields:

```
{
  "name": [string],
  "version": [string],
  "author": [string],
  "folderName" : [string],
  "description" : [string],
  "links" : {
    // object with optional fields, none are urls
    "twitter" : [string, handle without @],
    "twitch" : [string, username],
    "discord" : [string],
    "telegram" : [string, handle without @],
    "github" : [string, username],
    "kofi" : [string, username]
  }
}
```

`folderName` must be the name of the folder containing `theme.json`.
Themes may override any CSS properties defined in the `obs_src` html files by creating a css file
to replace one of the default `src/obs_src/css` files. You must name the theme css file the same
as one of the default css files, and you must place it in a `css` folder in your theme directory.
If you do not do this, the system will be unable to properly load your theme.

The theme directory structure should look like this:
```
themes
  /my-theme
    theme.json
    /css
    /images
    ...
  /other-theme
    theme.json
    ...
```

At this time, themes may not provide js override files.

A list of available overrides is not available, but you can look at the html files themselves
or open them up in Chrome/Firefox and use the web inspector to find the relevant classes and ids.

If you attempt to load two themes with the same name, the system will basically randomly
pick one to be active, so don't use duplicate names.

### Where can I get themes?

You might notice that the public build for the caster tool doesn't include any themes beyond the base
examples (many of which are pretty rough). Currently, theme development has been supported by
the [Casters for Hire Discord](https://discord.gg/H3DEyST). Hop on in there to get more info about
the tool and currently available themes.

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