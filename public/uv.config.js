self.__uv$config = {
    prefix: '/proxy/uv/',
    bare: 'https://v.hollywoodct.edu.eu.org/', 
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.handler.js',
    bundle: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.bundle.js',
    config: '/uv.config.js',
    sw: 'https://unpkg.com/@titaniumnetwork-dev/ultraviolet@2.0.0/dist/uv.sw.js',
};
