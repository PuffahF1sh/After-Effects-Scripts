// ReplaceShapeContentsByName.jsx
// Replaces the "Contents" of old animated shape layers with those of new ones,
// matched by name (e.g. "Star_01" ↔ "Star_01_new").

(function replaceShapeContentsByName() {
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select your layers inside an active composition.");
        return;
    }

    var layers = comp.selectedLayers;
    if (layers.length < 2) {
        alert("Please select both old and new layers.");
        return;
    }

    app.beginUndoGroup("Replace Shape Contents by Name");

    // Separate old vs new layers
    var oldLayers = {};
    var newLayers = [];

    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var lname = layer.name.toLowerCase();
        if (lname.endsWith("_new")) {
            newLayers.push(layer);
        } else {
            oldLayers[lname] = layer;
        }
    }

    var replacedCount = 0;

    for (var j = 0; j < newLayers.length; j++) {
        var newLayer = newLayers[j];
        var baseName = newLayer.name.replace(/_new$/i, "").toLowerCase();
        var oldLayer = oldLayers[baseName];

        if (!oldLayer) {
            alert("No matching old layer found for " + newLayer.name);
            continue;
        }

        // Make sure both are shape layers
        if (!(oldLayer.property("Contents") && newLayer.property("Contents"))) {
            alert("Both layers must be shape layers with 'Contents'. Problem at " + newLayer.name);
            continue;
        }

        var newContents = newLayer.property("Contents");
        var oldContents = oldLayer.property("Contents");

        // Remove existing contents in old layer
        while (oldContents.numProperties > 0) {
            oldContents.property(oldContents.numProperties).remove();
        }

        // Copy each group from new to old
        for (var k = 1; k <= newContents.numProperties; k++) {
            var group = newContents.property(k);
            group.duplicate(oldLayer); // AE doesn’t let us directly duplicate between layers, so:
            group.copyToComp(comp);
            var pasted = comp.selectedProperties[0];
            pasted.moveToBeginning(oldContents);
        }

        // Remove the new layer
        newLayer.remove();
        replacedCount++;
    }

    app.endUndoGroup();
    alert("Replaced contents for " + replacedCount + " layer(s).");
})();
