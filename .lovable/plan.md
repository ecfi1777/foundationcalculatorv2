

# Remove `postbuild` script from package.json

## Change
Remove the `"postbuild": "react-snap"` line from the `"scripts"` section in `package.json`. No other changes.

## Verification
- `postbuild` key removed from scripts
- `reactSnap` config key preserved
- `react-snap` remains in devDependencies
- No other files touched

