const fs = require("fs");
const path = require("path");

const cmakePath = path.join(__dirname, "../node_modules/react-native/ReactAndroid/cmake-utils/ReactNative-application.cmake");

let content = fs.readFileSync(cmakePath, "utf8");

const originalLine = 'add_subdirectory(${PROJECT_BUILD_DIR}/generated/source/codegen/jni/ codegen_app_build)';
const patchedLine = `
if(EXISTS "\${PROJECT_BUILD_DIR}/generated/source/codegen/jni/")
  ${originalLine}
endif()`;

if (!content.includes("if(EXISTS") && content.includes(originalLine)) {
  content = content.replace(originalLine, patchedLine);
  fs.writeFileSync(cmakePath, content, "utf8");
  console.log("✅ ReactNative-application.cmake patched successfully.");
} else {
  console.log("ℹ️ Already patched or line not found.");
}