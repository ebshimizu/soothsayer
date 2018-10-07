# hots-caster-tool

A tool for generating OBS overlays for casting Heroes of the Storm.
Inspired by the [StarCraft Casting Tool](https://github.com/teampheenix/StarCraft-Casting-Tool)

## Usage

Currently in development. There is no dist for the project yet.

### Available Overlays

Overlays should be added to OBS as a Browser Source using the Local File option
and no custom CSS. Use the reccomended resolutions as the browser source size.
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
* `caster-single-frame.html`
  * Caster frame (for webcams). Default file is not recommended for use, as it is partially styled
  * Required Resolution: 1920 x 1080
* `caster-single-side-facts.html`
  * No Default Style
  * Intended use: caster frame with sidebox for facts/text
  * Required Resolution: 1920 x 1080

## Theming

Themes can be added to the `src/obs_src/themes` folder. Themes require a `theme.json` file with the
following fields:

```
{
  "name": [string],
  "version": [string],
  "author": [string],
  "folderName" : [string]
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
* Investigate integration with other hots apps (specifically stats of the storm)