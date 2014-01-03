// 1. Listen for lt to close (does this cover forced closes?
//    If not, Perhaps listen for fopen/close).
// 2. Record opened files as a list within each tabgroup. tabs[groupIdx][fileIdx]
// 3. On lt open, if behavior is included, restore last workspace.
