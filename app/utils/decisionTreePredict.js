import fs from "fs";
import path from "path";

// Load tree model
const treePath = path.join(process.cwd(), "models", "food_tree_model_from_tracking.json");
const labelPath = path.join(process.cwd(), "models", "label_map_from_tracking.json");

const tree = JSON.parse(fs.readFileSync(treePath, "utf-8"));
const labelMap = JSON.parse(fs.readFileSync(labelPath, "utf-8")).food_label_to_name;

/**
 * Recursive traversal of the decision tree
 */
function traverse(node, features) {
    if (node.leaf) {
        return node.class;
    }

    const featureValue = features[node.feature];

    // Numeric comparison
    if (featureValue <= node.threshold) {
        return traverse(node.left, features);
    } else {
        return traverse(node.right, features);
    }
}

/**
 * Predict food label from features
 */
export function predictFood(features) {
    const labelId = traverse(tree, features);
    const foodName = labelMap[labelId.toString()] || "Unknown Food";
    return { labelId, foodName };
}
