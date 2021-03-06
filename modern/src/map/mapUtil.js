export const loadMapImage = (map, url) => new Promise((resolve, reject) => {
  map.loadImage(url, function (err, image) {
    if (err) return reject(err);

    resolve(image)
  })
})

export const loadImage = (url) => {
  return new Promise(imageLoaded => {
    const image = new Image();
    image.onload = () => imageLoaded(image);
    image.src = url;
  });
};

export const loadIcon = async (key, background, url) => {
  const image = await loadImage(url);
  const pixelRatio = window.devicePixelRatio;

  const canvas = document.createElement('canvas');
  canvas.width = background.width * pixelRatio;
  canvas.height = background.height * pixelRatio;
  canvas.style.width = `${background.width}px`;
  canvas.style.height = `${background.height}px`;

  const context = canvas.getContext('2d');
  context.drawImage(background, 0, 0, canvas.width, canvas.height);

  const iconRatio = 0.5;
  const imageWidth = canvas.width * iconRatio;
  const imageHeight = canvas.height * iconRatio;
  context.drawImage(image, (canvas.width - imageWidth) / 2, (canvas.height - imageHeight) / 2, imageWidth, imageHeight);

  return context.getImageData(0, 0, canvas.width, canvas.height);
};

export const reverseCoordinates = it => {
  if (!it) {
    return it;
  } else if (Array.isArray(it)) {
    if (it.length === 2 && !Number.isNaN(it[0]) && !Number.isNaN(it[1])) {
      return [it[1], it[0]];
    } else {
      return it.map(it => reverseCoordinates(it));
    }
  } else {
    return {
      ...it,
      coordinates: reverseCoordinates(it.coordinates),
    }
  }
}

export const downloadGeoJson = (data, filename) => {
  var file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/jsons' });
  if (window.navigator.msSaveOrOpenBlob) // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}

export const mapDrawStyles = [
  {
    'id': 'marker-default-active',
    'type': 'symbol',
    'layout': {
      'icon-image': [
        'coalesce',
        // TODO: Now 'get' expression does not work as documentation https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/#get
        // If below line would be uncommented then got this warning 'Expected value to be of type string, but found null instead.'
        // ['image', ['get', 'icon']], 
        ['image', 'marker-default']
      ],
      'icon-allow-overlap': true
    },
    'filter': [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['==', 'active', 'true']
    ]
  },
  {
    'id': 'marker-default-inactive',
    'type': 'symbol',
    'layout': {
      'icon-image': [
        'coalesce',
        //['image', ['get', 'icon']],
        ['image', 'marker-default']
      ],
      'icon-allow-overlap': true
    },
    'filter': [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['==', 'active', 'false']
    ],
  },
  // ACTIVE (being drawn)
  // line stroke
  {
    "id": "gl-draw-line",
    "type": "line",
    "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#D20C0C",
      "line-dasharray": [0.2, 2],
      "line-width": 2
    }
  },
  // polygon fill
  {
    "id": "gl-draw-polygon-fill",
    "type": "fill",
    "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    "paint": {
      "fill-color": "#D20C0C",
      "fill-outline-color": "#D20C0C",
      "fill-opacity": 0.1
    }
  },
  // polygon outline stroke
  // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
  {
    "id": "gl-draw-polygon-stroke-active",
    "type": "line",
    "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#D20C0C",
      "line-dasharray": [0.2, 2],
      "line-width": 2
    }
  },
  // vertex point halos
  {
    "id": "gl-draw-polygon-and-line-vertex-halo-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    "paint": {
      "circle-radius": 5,
      "circle-color": "#FFF"
    }
  },
  // vertex points
  {
    "id": "gl-draw-polygon-and-line-vertex-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
    "paint": {
      "circle-radius": 3,
      "circle-color": "#D20C0C",
    }
  },

  // INACTIVE (static, already drawn)
  // line stroke
  {
    "id": "gl-draw-line-static",
    "type": "line",
    "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#000",
      "line-width": 3
    }
  },
  // polygon fill
  {
    "id": "gl-draw-polygon-fill-static",
    "type": "fill",
    "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    "paint": {
      "fill-color": "#000",
      "fill-outline-color": "#000",
      "fill-opacity": 0.1
    }
  },
  // polygon outline
  {
    "id": "gl-draw-polygon-stroke-static",
    "type": "line",
    "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#000",
      "line-width": 3
    }
  }
]
