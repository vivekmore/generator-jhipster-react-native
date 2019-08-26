const { patchNeedle } = require('../lib/patch-needle')

const patchReactNativeNavigation = async (context = {}, props) => {
  // REACT_NATIVE_NAVIGATION_VERSION
  const {
    ignite,
    print
  } = context

  const spinner = print.spin('installing and linking react-native-navigation')
  spinner.start()

  // print.info('Installing and linking react-native-navigation')
  // set java packageName for android patches
  props.packageName = props.name.toLowerCase()

  const navigationFiles = [
    { template: 'AppDelegate.m.ejs', target: `ios/${props.name}/AppDelegate.m` },
    { template: 'MainActivity.java.ejs', target: `android/app/src/main/java/com/${props.name.toLowerCase()}/MainActivity.java` },
    { template: 'MainApplication.java.ejs', target: `android/app/src/main/java/com/${props.name.toLowerCase()}/MainApplication.java` }
  ]
  if (props.authType === 'oauth2') {
    navigationFiles.push({ template: 'AppDelegate.h.ejs', target: `ios/${props.name}/AppDelegate.h` })
  }
  await ignite.copyBatch(context, navigationFiles, props, {
    quiet: true,
    directory: `${__dirname}/../../templates/react-native-navigation/`
  })

  // related to https://github.com/gcanti/tcomb-form-native/pull/560
  const rnnPatch = [
    { template: 'patches/tcomb-form-native+0.6.20.patch', target: `patches/tcomb-form-native+0.6.20.patch` }
  ]
  await ignite.copyBatch(context, rnnPatch, props, {
    quiet: true,
    directory: `${__dirname}/../../boilerplate`
  })

  spinner.succeed('set up react-native-navigation for iOS/Android')
  await updateIosFiles(context, props)
  await updateAndroidFiles(context, props)
}
const updateIosFiles = async (context, props) => {
  /*eslint-disable */
  await patchNeedle(context, `${process.cwd()}/ios/${props.name}/Info.plist`, {
    before: `<key>CFBundleDisplayName</key>`,
    insert: `
<key>CFBundleURLTypes</key>
	<array>
		<dict>
			<key>CFBundleTypeRole</key>
			<string>Editor</string>
			<key>CFBundleURLName</key>
			<string>${props.name.toLowerCase()}</string>
			<key>CFBundleURLSchemes</key>
			<array>
				<string>${props.name.toLowerCase()}</string>
			</array>
		</dict>
	</array>`
  })
  /* eslint-enable */
}

const updateAndroidFiles = async (context, props) => {
  // settings.gradle
  await patchNeedle(context, `${process.cwd()}/android/settings.gradle`, {
    after: `include ':app'`,
    insert: `include ':react-native-navigation'\nproject(':react-native-navigation').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-navigation/lib/android/app/')`
  })

  // build.gradle
  await patchNeedle(context, `${process.cwd()}/android/build.gradle`, {
    before: `mavenLocal()`,
    insert: `        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }`
  })

  await patchNeedle(context, `${process.cwd()}/android/build.gradle`, {
    after: `repositories {`,
    insert: `        google()
        mavenLocal()
        mavenCentral()`
  })

  // react-native-init uses a later version so this is not currently needed
  // await patchNeedle(context, `${process.cwd()}/android/build.gradle`, {
  //   replace: `buildToolsVersion = "26.0.3"`,
  //   insert: `buildToolsVersion = "28.0.3"`
  // })

  await patchNeedle(context, `${process.cwd()}/android/build.gradle`, {
    replace: `minSdkVersion = 16`,
    insert: `minSdkVersion = 19`
  })

  // app/build.gradle
  await patchNeedle(context, `${process.cwd()}/android/app/build.gradle`, {
    after: `versionCode 1`,
    insert: `        missingDimensionStrategy "RNN.reactNativeVersion", "reactNative57_5"`
  })

  await patchNeedle(context, `${process.cwd()}/android/app/build.gradle`, {
    before: `buildTypes {`,
    insert: `    compileOptions {
      sourceCompatibility JavaVersion.VERSION_1_8
      targetCompatibility JavaVersion.VERSION_1_8
    }`
  })

  await patchNeedle(context, `${process.cwd()}/android/app/build.gradle`, {
    before: `dependencies {`,
    insert: `configurations.all {
      resolutionStrategy.eachDependency { DependencyResolveDetails details ->
          def requested = details.requested
          if (requested.group == 'com.android.support') {
              details.useVersion "\${rootProject.ext.supportLibVersion}"
          }
      }
  }`
  })
  await patchNeedle(context, `${process.cwd()}/android/app/build.gradle`, {
    after: `dependencies {`,
    insert: `
    implementation "com.facebook.react:react-native:+"  // From node_modules
    implementation project(':react-native-navigation')`
  })
}

module.exports = {
  patchReactNativeNavigation
}
