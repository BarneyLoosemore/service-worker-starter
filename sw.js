const ASSETS = [
  "/partials/offline.html",
  "/partials/header-partial.html",
  "/partials/footer-partial.html",
  "/css/index.css",
];

addEventListener("install", (event) => {
  console.log("installing");
  event.waitUntil(
    caches.open("cache-v1").then((cache) => {
      cache.addAll(ASSETS);
    })
  );
});

addEventListener("activate", (event) => {
  console.log("activating");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== "cache-v1") {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const contentPartial = fetch(event.request.url, {
          headers: {
            "x-render-partial": "true",
          },
        }).catch(() => caches.match("/partials/offline.html"));

        const partials = [
          caches.match("/partials/header-partial.html"),
          contentPartial,
          caches.match("/partials/footer-partial.html"),
        ];

        const { done, response } = await mergeResponses(partials);

        event.waitUntil(done);
        return response;
      })()
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((res) => res || fetch(event.request))
    );
  }
});

const mergeResponses = async (responses) => {
  const { readable, writable } = new TransformStream();

  const done = (async () => {
    for await (const response of responses) {
      await response.body.pipeTo(writable, { preventClose: true });
    }
    writable.getWriter().close();
  })();

  return {
    done,
    response: new Response(readable, {
      headers: (await responses[0]).headers,
    }),
  };
};
