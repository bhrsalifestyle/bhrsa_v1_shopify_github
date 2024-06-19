var SMI_VideoBackground = (function (){
    class SMI_VideoBackground extends HTMLElement {
        constructor() {
            super();
        }

        static get observedAttributes() {
            return ['paused'];
        }

        get paused() {
            return this.hasAttribute('paused');
        }

        set paused(val) {
            if (val) {
                this.setAttribute('paused', '');
            } else {
                this.removeAttribute('paused');
            }
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (name === 'paused') {
                this.paused ? this.pauseVideo() : this.playVideo();
            }

        }

        connectedCallback() {
            this._fitCoverVideo();
            this._handleThumbnailYoutube();

            this.paused ? this.pauseVideo() : this.playVideo();
        }

        pauseVideo() {
            const videoVimeo = this.querySelector('.smi-js-vimeo');
            const videoYoutube = this.querySelector('.smi-js-youtube');
            const videoUpload = this.querySelector('.smi-upload-video video');

            if (videoVimeo) videoVimeo.contentWindow.postMessage('{"method":"pause"}', '*');
            if (videoYoutube) videoYoutube.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*");
            if (videoUpload) videoUpload.pause();
        }

        playVideo() {
            const videoVimeo = this.querySelector('.smi-js-vimeo');
            const videoYoutube = this.querySelector('.smi-js-youtube');
            const videoUpload = this.querySelector('.smi-upload-video video');

            if (videoVimeo) {
                videoVimeo.contentWindow.postMessage('{"method":"play"}', '*')
            }

            if (videoYoutube){
                videoYoutube.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', "*");
            }

            if (videoUpload){
                let timeout;
                (() => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => videoUpload.play(), 150);
                })();
            }
        }


        _handleThumbnailYoutube() {
            const thumbnail = this.querySelector('.smi-youtube-thumbnail');
            if (thumbnail && thumbnail.naturalWidth < 150) {
                thumbnail.src = thumbnail.src.replace('maxresdefault', 'hqdefault')
            }
        }

        _parseResolutionString(res) {
            const pts = res.split(/\s?:\s?/i);
            const DEFAULT_RESOLUTION = 16 / 9;
            if (pts.length < 2) {
                return DEFAULT_RESOLUTION;
            }

            const w = parseInt(pts[0], 10);
            const h = parseInt(pts[1], 10);

            if (isNaN(w) || isNaN(h)) {
                return DEFAULT_RESOLUTION;
            }

            return w / h;
        }

        _fitCoverVideo() {
            const resolution_mod = this._parseResolutionString("16:9");
            const onResize = () => {
                const iframes = this.querySelectorAll('iframe')
                if (iframes.length) {
                    const wrap = this;
                    const h = wrap.offsetHeight + 200;
                    const w = wrap.offsetWidth + 200;
                    const res = resolution_mod;
                    iframes.forEach(iframe => {
                        if (iframe.classList.contains('smi-background-video')) {
                            if (res > w / h) {
                                iframe.style.width = h * res + 'px';
                                iframe.style.height = h + 'px';
                            } else {
                                iframe.style.width = w + 'px';
                                iframe.style.height = w / res + 'px';
                            }
                        }
                    })
                }
            }

            window.addEventListener('resize', () => {
                window.requestAnimationFrame(onResize);
            });

            onResize();

            setTimeout(()=>{
                onResize();
            },1000)
        }
    }
    return SMI_VideoBackground;
})();

