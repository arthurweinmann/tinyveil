<p align="center">
    <img src="doc/logo.png"/>
</p>

# A library to write Javascript that Lasts Forever

Tinyveil is a library providing a type system, protocols and helpers in Vanilla Javascript. The goal is to make development in Vanilla JS faster, safer and more readable. 

Tinyveil aims to occupy the role of a library and not a framework like typescript or reactjs. The best reason to write a library in plain JavaScript is that it lasts forever. This is arguably JavaScript’s single most underrated feature. It also runs in the browser directly, without a runtime or a compilation step. 

With a framework or a compiler, you can easily find yourself stuck with it even after outgrowning it or disliking its ecosystem (or the framework has stagnated for too long), and you want to switch. This can be really hard, because frameworks shape your code, and each framework is different, so there is no easy migration path. The contact surface with libraries, on the other hand, is often very small, making a switch from one library to another a much smaller task, with a low blast radius.

Tinyveil is in active development and research. Currently, it offers an immediate and proactive way of validating data types during the development process. It throws errors immediately when a type mismatch or invalid parameter is detected, facilitating early error discovery and making debugging easier. We also have an helper to validate the type of an Object. This function is then used in a WebsocketAPI class helper to validate both the request object sent to a backend and the response received from the same backend.

This library is a simple way to enforce strict type checking with zero maintenance costs. Even if this library changes in the future, you will be able to keep your imported copy from a previous version, which will continue to work as long as browsers exist since it is written in vanilla javascript only.

## An interesting experiment

To illustrate why a library may be a better idea than a framework, here is how you would create an empty react application:

```bash
Arthur$ npx create-react-app my-app
```

We can then list the number of dependencies in this newly created empty react application without any feature other than what comes out of the box:

```bash
Arthur$ cd my-app
Arthur$ npm ls --all | wc -l
```

There is more than 3000 dependencies in a blank react project! You did not even write a single line of code for your application yet and you already have much complexity, entropy and future maintenance cost out of the box.

# Current Features

- Javascript type assertions with some nice quirks
- Object check against a type schema
- A Websocket API class
- An ASYNC helper to write async code without async/await and without callback hell.
- An interesting alpha experiment of an HTML node type compiling to and from an HTMLElement recursively. It can then be used to generate HTMLElement of the same type but with a different content.

# Status

This library is still in active development. Expect a lot of changes. I am using it in one of my projects and make it better along the way.

# Import in my Makefile

By importing tinyveil.js and committing it into your repository, you create at the same time an association between each version of tinyveil and of your project. This way, you can always revert back reliably.

```Makefile
.PHONY: fetch-tinyveil
fetch-tinyveil: $(BUILDDIR)
	cd $(CURDIR) && rm -f web/js/lib/tinyveil.js && cd $(BUILDDIR) && rm -rf tmp && mkdir tmp && cd tmp && \
	git clone https://github.com/arthurweinmann/tinyveil.git && \
	cd tinyveil && mv tinyveil.js $(CURDIR)/web/js/lib/ && cd $(BUILDDIR) && rm -rf tmp

$(BUILDDIR):
	@mkdir -p $(BUILDDIR)
```

# Usage

A complete usage guide is coming soon! In the meantime, the code in the [Tinyveil library file](tinyveil.js) is quite readable.

## License

Please refer to the license file.
