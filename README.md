# onfig
Manage JSON configuration across environments in NodeJS

```
npm install --save onfig
```

## What?
The humble goal of *onfig* is to remove any friction for differing
environment configurations.

One example is defining different
database details for development and production setups.

Another is declaring a flag
that only the development environment will need to use, such as a
**debug** = **true** flag.

## How?
There's a couple of ways to use onfig but regardless of the approach the
way onfig works is by using a base configuration then overriding it
with environment specific configuration.

By default onfig will use the **NODE_ENV** environment variable to decide
what is the desired configuration. This can be easily be set programmatically
as you'll see in the example below.

Consider the following project
```
lib/
    app.js

    config/
        ...
        configuration.base.json
        configuration.development.json
        configuration.production.json
        ...

```


The application can load the configuration for development like this -
```javaascript
const Onfig = require("onfig");

Onfig
    .env("development")
    .load("configuration")
    .then(provider => {
        const host = provider.get("DATABASE_HOST");
        const user = provider.get("DATABASE_USER");
        const pass = provider.get("DATABASE_PASS");

        //....
    })

```

After a load is performed you can reference the provider by
using **Onfig.get** for future access
```javascript

//....
const config = Onfig.get("configuration");

const host = config.get("DATABASE_HOST");
const user = config.get("DATABASE_USER");
const pass = config.get("DATABASE_PASS");
//....
```

Here's some important notes about the example
- Onfig uses the **config/** root by default.
- The ENV property was programmatically set to **development**
- The name of the configuration was passed in to the **load** method.
- Onfig searches for a file suffixed with **base** before looking for the
file intended for the environment **configuration.development.json**

This approach is the default but can be changed, see configuration below!

## Provider

You may have noticed that the result of loading a configuration is not a
native object. Instead it's a provider that has some simple functions that
provide access to the configuration that was loaded.

The methods available are
- get<T>(key, ifNull = null):T
- set(key, value):Provider
- has(key):boolean
- remove(key:string):Provider
- keys():string[]

The **GET** action accepts a second parameter of the value to use when the
key does not exists in the configuration.
```javascript
const config = Onfig.get("configuration");

const debug = config.get("debug", false);
```

The above example will default to false if the "debug" flag does not
exists in the JSON configurations loaded.

By default when no second parameter is provided and the key does not
exist - a **null** is returned.

## Configuration
The env example used earlier is an example of configuring the onfig
loader.

```javascript
Onfig.env("development");
```

This is a short hand for using the **configure** method
```javascript
Onfig.configure({
    environment: "development"
});
```

Available keys for configure are -

**environment**
 - A string value or a function that returns a string value. This will determine
 the **ENV** property when loading configuration files from disk.
  - This is defaulted to; ```() => process.env.NODE_ENV```. This loads the NODE_ENV
  property from the node process.
  
**precedence**
 - A string array or a function that returns a string array. This will determine
 what files get loaded and in which order they get loaded in. The **%ENV%**
 string will be replaced with the environment above during load.
 - This is defaulted to; ```["base", "%ENV%"]```. This means search for a
 file suffixed with **.base.json** then merge this with the file **%ENV%.json**
 which in determined by the environment configuration above

**root**
 - A string value or a function that returns a string value. This will determine
 the root directory to search for configuration in.
 - This is defaulted to; ```./config```. Meaning search for configuration in
 the base directory's sub-directory "config" of the calling module

## Loading
If a file (such as the base) can not be found, onfig will not error out.

This means if no configuration existed in the **config** directory and a load
was call, the provider will be seeded with an empty object. This can be
useful for scaffolding a new project with the eventual goal being to use a
configuration file.

The load method can be passed many arguments and returns a promise of the
providers for each argument.
```javscript
Onfig.load(
    "express",
    "database",
    "webpack"
).then(([express, database, webpack]) => {
    console.log(express.keys());
    console.log(database.keys());
    console.log(webpack.keys());
});
```

The provide method can be used to load a pre-built object.
```javascript
Onfig.provide("database", {
    "DB_USER": "...",
    "DB_HOST": "..."
});
```
The rest of the provider flow will still work the same and no disk-read
will be performed.

There are two ways to structure your folders containing your configuration.
- Use the root directory (as seen in the first example)
```
lib/
    app.js

    config/
        express.base.json
        express.development.json
        express.production.json
        database.base.json
        database.development.json
        database.production.json
        webpack.base.json
        webpack.development.json
        webpack.production.json

```

- Use a sub-folder titled with configuration name in the root directory
```
lib/
    app.js

    config/
        express/
            express.base.json
            express.development.json
            express.production.json
        database/
            database.base.json
            database.development.json
            database.production.json
        webpack/
            webpack.base.json
            webpack.development.json
            webpack.production.json

```

The second approach is helpful for splitting up configuration in a
meaningful way and no extra code is needed to make it work.

```javascript
Onfig.load(
    "express",
    "database",
    "webpack"
)
```

## Typescript Support

Yes **d.ts** files come packed with the project!

## Contribution
Forks and pull requests are open to any one.

This is a simple initiative but I'm game for any improvements.