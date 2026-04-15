/**
 * AMM Taxi Frankfurt - Main JavaScript
 * Barrierefreundliche Interaktionen und Animationen
 */

(function() {
    'use strict';

    // ========================================
    // DOM Ready
    // ========================================
    document.addEventListener('DOMContentLoaded', function() {
        initNavigation();
        initSlider();
        initScrollAnimations();
        initCounterAnimation();
        initGPSTracking();
        initSmoothScroll();
        initFormValidation();
        initParallaxMap();
        initDriversSlider();
        initFrankfurtMap();
    });

    // ========================================
    // Navigation
    // ========================================
    function initNavigation() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (!navToggle || !navMenu) return;
        
        navToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });
        
        // Close menu on link click
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu on outside click
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            }
        });
        
        // Active link highlighting
        const sections = document.querySelectorAll('section[id]');
        
        window.addEventListener('scroll', function() {
            let current = '';
            
            sections.forEach(function(section) {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                
                if (window.scrollY >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(function(link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        }, { passive: true });
    }

    // ========================================
    // Hero Image Slider
    // ========================================
    function initSlider() {
        const slider = document.getElementById('heroSlider');
        if (!slider) return;
        
        const slides = slider.querySelectorAll('.hero-slide');
        const dots = slider.querySelectorAll('.slider-dot');
        const prevBtn = document.getElementById('sliderPrev');
        const nextBtn = document.getElementById('sliderNext');
        
        if (slides.length === 0) return;
        
        let currentSlide = 0;
        let slideInterval;
        const slideDuration = 5000; // 5 seconds
        
        function showSlide(index) {
            // Remove active class from all slides and dots
            slides.forEach(function(slide) {
                slide.classList.remove('active');
            });
            dots.forEach(function(dot) {
                dot.classList.remove('active');
            });
            
            // Add active class to current slide and dot
            slides[index].classList.add('active');
            dots[index].classList.add('active');
            
            currentSlide = index;
        }
        
        function nextSlide() {
            const next = (currentSlide + 1) % slides.length;
            showSlide(next);
        }
        
        function prevSlide() {
            const prev = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(prev);
        }
        
        function startAutoSlide() {
            slideInterval = setInterval(nextSlide, slideDuration);
        }
        
        function stopAutoSlide() {
            clearInterval(slideInterval);
        }
        
        // Event listeners for buttons
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                stopAutoSlide();
                prevSlide();
                startAutoSlide();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                stopAutoSlide();
                nextSlide();
                startAutoSlide();
            });
        }
        
        // Event listeners for dots
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                stopAutoSlide();
                showSlide(index);
                startAutoSlide();
            });
        });
        
        // Pause on hover
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);
        
        // Start auto-slide
        startAutoSlide();
    }

    // ========================================
    // Scroll Animations (Intersection Observer)
    // ========================================
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('[data-animate]');
        
        if (animatedElements.length === 0) return;
        
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animatedElements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ========================================
    // Counter Animation
    // ========================================
    function initCounterAnimation() {
        const counters = document.querySelectorAll('[data-count]');
        
        if (counters.length === 0) return;
        
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-count'));
                    animateCounter(counter, target);
                    observer.unobserve(counter);
                }
            });
        }, observerOptions);
        
        counters.forEach(function(counter) {
            observer.observe(counter);
        });
    }

    function animateCounter(element, target) {
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(function() {
            current += increment;
            
            if (current >= target) {
                element.textContent = target.toLocaleString('de-DE');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current).toLocaleString('de-DE');
            }
        }, duration / steps);
    }

    // ========================================
    // GPS Tracking for Taxi Order
    // ========================================
    function initGPSTracking() {
        const gpsButton = document.getElementById('gpsButton');
        const pickupInput = document.getElementById('pickup');
        const gpsStatus = document.getElementById('gpsStatus');
        
        if (!gpsButton || !pickupInput) return;
        
        gpsButton.addEventListener('click', function() {
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                showGPSStatus('Ihr Browser unterstützt keine Standortermittlung.', 'error');
                return;
            }
            
            // Show loading state
            gpsButton.classList.add('loading');
            gpsButton.disabled = true;
            showGPSStatus('Standort wird ermittelt...', '');
            
            // Get position
            navigator.geolocation.getCurrentPosition(
                // Success callback
                function(position) {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    // Reverse geocoding using OpenStreetMap Nominatim
                    fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=18&addressdetails=1')
                        .then(function(response) {
                            return response.json();
                        })
                        .then(function(data) {
                            gpsButton.classList.remove('loading');
                            gpsButton.disabled = false;
                            
                            if (data && data.display_name) {
                                // Format address
                                const address = formatAddress(data.address);
                                pickupInput.value = address;
                                showGPSStatus('Standort erfolgreich ermittelt!', 'success');
                                
                                // Clear status after 3 seconds
                                setTimeout(function() {
                                    gpsStatus.textContent = '';
                                    gpsStatus.className = 'gps-status';
                                }, 3000);
                            } else {
                                showGPSStatus('Adresse konnte nicht ermittelt werden.', 'error');
                            }
                        })
                        .catch(function(error) {
                            gpsButton.classList.remove('loading');
                            gpsButton.disabled = false;
                            showGPSStatus('Fehler bei der Adressermittlung.', 'error');
                            console.error('Geocoding error:', error);
                        });
                },
                // Error callback
                function(error) {
                    gpsButton.classList.remove('loading');
                    gpsButton.disabled = false;
                    
                    let errorMessage = 'Standort konnte nicht ermittelt werden.';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Standortzugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Standortinformation nicht verfügbar.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Zeitüberschreitung bei der Standortermittlung.';
                            break;
                    }
                    
                    showGPSStatus(errorMessage, 'error');
                },
                // Options
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    function formatAddress(address) {
        const parts = [];
        
        if (address.road) parts.push(address.road);
        if (address.house_number) parts.push(address.house_number);
        if (address.postcode) parts.push(address.postcode);
        if (address.city || address.town || address.village) {
            parts.push(address.city || address.town || address.village);
        }
        
        return parts.join(', ');
    }

    function showGPSStatus(message, type) {
        const gpsStatus = document.getElementById('gpsStatus');
        if (!gpsStatus) return;
        
        gpsStatus.textContent = message;
        gpsStatus.className = 'gps-status' + (type ? ' ' + type : '');
    }

    // ========================================
    // Smooth Scroll
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    e.preventDefault();
                    
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // Header Scroll Effect
    // ========================================
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        
        if (!header) return;
        
        let lastScroll = 0;
        
        window.addEventListener('scroll', function() {
            const currentScroll = window.scrollY;
            
            // Add shadow on scroll
            if (currentScroll > 10) {
                header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            } else {
                header.style.boxShadow = '0 4px 6px rgba(0,0,0,0.07)';
            }
            
            lastScroll = currentScroll;
        }, { passive: true });
    }

    // ========================================
    // Parallax Effect
    // ========================================
    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        if (parallaxElements.length === 0) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateParallax(parallaxElements);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    function updateParallax(elements) {
        const scrollY = window.scrollY;
        
        elements.forEach(function(el) {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
            const yPos = scrollY * speed;
            el.style.transform = 'translateY(' + yPos + 'px)';
        });
    }

    // ========================================
    // Parallax Map Background for Order Section
    // ========================================
    function initParallaxMap() {
        const orderSection = document.querySelector('.order-section');
        if (!orderSection) return;
        
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;
        
        let ticking = false;
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    const scrollY = window.scrollY;
                    const sectionTop = orderSection.offsetTop;
                    const sectionHeight = orderSection.offsetHeight;
                    const windowHeight = window.innerHeight;
                    
                    // Only animate when section is in viewport
                    if (scrollY + windowHeight > sectionTop && scrollY < sectionTop + sectionHeight) {
                        const parallaxSpeed = 0.3;
                        const yPos = (scrollY - sectionTop) * parallaxSpeed;
                        orderSection.style.setProperty('--parallax-y', yPos + 'px');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ========================================
    // Drivers Slider
    // ========================================
    function initDriversSlider() {
        const slider = document.getElementById('driversSlider');
        const track = slider ? slider.querySelector('.drivers-track') : null;
        const prevBtn = document.getElementById('driversPrev');
        const nextBtn = document.getElementById('driversNext');
        const dots = document.querySelectorAll('.drivers-dot');
        
        if (!track) return;
        
        let currentSlide = 0;
        const totalSlides = dots.length;
        
        function updateSlider() {
            const slideWidth = slider.offsetWidth;
            const cardsPerView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;
            const cardWidth = track.querySelector('.driver-card').offsetWidth + 30; // gap
            const offset = currentSlide * cardWidth * cardsPerView;
            track.style.transform = 'translateX(-' + offset + 'px)';
            
            dots.forEach(function(dot, index) {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentSlide = Math.max(0, currentSlide - 1);
                updateSlider();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentSlide = Math.min(totalSlides - 1, currentSlide + 1);
                updateSlider();
            });
        }
        
        dots.forEach(function(dot, index) {
            dot.addEventListener('click', function() {
                currentSlide = index;
                updateSlider();
            });
        });
        
        window.addEventListener('resize', updateSlider);
    }

    // ========================================
    // Frankfurt Map with Leaflet
    // ========================================
    function initFrankfurtMap() {
        const mapContainer = document.getElementById('frankfurtMap');
        if (!mapContainer) return;
        
        // Leaflet Karte initialisieren (Frankfurt Zentrum)
        const map = L.map('frankfurtMap', {
            center: [50.1109, 8.6821],
            zoom: 12,
            minZoom: 11,
            maxZoom: 16,
            scrollWheelZoom: true
        });
        
        // OpenStreetMap Layer hinzufügen
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(map);
        
        // Stadtteil-Marker mit Koordinaten
        const stadtteile = [
            { name: 'Innenstadt', coords: [50.1109, 8.6821] },
            { name: 'Westend', coords: [50.1189, 8.6631] },
            { name: 'Nordend', coords: [50.1289, 8.6921] },
            { name: 'Bahnhofsviertel', coords: [50.1079, 8.6631] },
            { name: 'Sachsenhausen', coords: [50.0989, 8.6821] },
            { name: 'Bornheim', coords: [50.1289, 8.7121] },
            { name: 'Bockenheim', coords: [50.1189, 8.6421] },
            { name: 'Ostend', coords: [50.1189, 8.7221] },
            { name: 'Gallus', coords: [50.0989, 8.6421] },
            { name: 'Höchst', coords: [50.0989, 8.5421] },
            { name: 'Niederrad', coords: [50.0889, 8.6421] },
            { name: 'Griesheim', coords: [50.0889, 8.6221] },
            { name: 'Praunheim', coords: [50.1389, 8.6221] },
            { name: 'Rödelheim', coords: [50.1289, 8.6021] },
            { name: 'Kalbach', coords: [50.1589, 8.6421] },
            { name: 'Bergen-Enkheim', coords: [50.1589, 8.7621] },
            { name: 'Fechenheim', coords: [50.1389, 8.7621] },
            { name: 'Seckbach', coords: [50.1489, 8.7221] },
            { name: 'Riederwald', coords: [50.1389, 8.7421] },
            { name: 'Nied', coords: [50.0789, 8.6221] },
            { name: 'Hausen', coords: [50.0689, 8.6021] },
            { name: 'Goldstein', coords: [50.0589, 8.5821] },
            { name: 'Sindlingen', coords: [50.0489, 8.5221] },
            { name: 'Zeilsheim', coords: [50.0689, 8.5421] },
            { name: 'Sossenheim', coords: [50.0789, 8.5621] },
            { name: 'Unterliederbach', coords: [50.0889, 8.5021] },
            { name: 'Schwanheim', coords: [50.0989, 8.5221] },
            { name: 'Flughafen', coords: [50.0389, 8.5621] },
            { name: 'Niederursel', coords: [50.1689, 8.6221] },
            { name: 'Heddernheim', coords: [50.1589, 8.6021] }
        ];
        
        // Marker hinzufügen
        const markers = {};
        stadtteile.forEach(function(stadtteil) {
            const marker = L.circleMarker(stadtteil.coords, {
                radius: 8,
                fillColor: '#1a5f7a',
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);
            
            marker.bindPopup('<b>' + stadtteil.name + '</b>');
            markers[stadtteil.name] = marker;
        });
        
        // Interaktion mit Chips
        const chips = document.querySelectorAll('.stadtteil-chip');
        
        chips.forEach(function(chip) {
            const stadtteilName = chip.getAttribute('data-stadtteil');
            
            chip.addEventListener('mouseenter', function() {
                if (markers[stadtteilName]) {
                    markers[stadtteilName].setStyle({
                        fillColor: '#e76f51',
                        radius: 12
                    });
                    markers[stadtteilName].openPopup();
                }
                chip.classList.add('active');
            });
            
            chip.addEventListener('mouseleave', function() {
                if (markers[stadtteilName]) {
                    markers[stadtteilName].setStyle({
                        fillColor: '#1a5f7a',
                        radius: 8
                    });
                    markers[stadtteilName].closePopup();
                }
                chip.classList.remove('active');
            });
        });
        
        // Karte bei Fenstergrößenänderung neu laden
        window.addEventListener('resize', function() {
            map.invalidateSize();
        });
    }

    // ========================================
    // Form Validation
    // ========================================
    function initFormValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(function(form) {
            form.addEventListener('submit', function(e) {
                const requiredFields = form.querySelectorAll('[required]');
                let isValid = true;
                
                requiredFields.forEach(function(field) {
                    if (!field.value.trim()) {
                        isValid = false;
                        field.classList.add('error');
                        
                        // Add error message if not exists
                        let errorMsg = field.parentElement.querySelector('.error-message');
                        if (!errorMsg) {
                            errorMsg = document.createElement('span');
                            errorMsg.className = 'error-message';
                            errorMsg.style.color = 'var(--color-error)';
                            errorMsg.style.fontSize = '0.875rem';
                            errorMsg.style.marginTop = '0.25rem';
                            errorMsg.style.display = 'block';
                            field.parentElement.appendChild(errorMsg);
                        }
                        errorMsg.textContent = 'Dieses Feld ist erforderlich.';
                    } else {
                        field.classList.remove('error');
                        const errorMsg = field.parentElement.querySelector('.error-message');
                        if (errorMsg) {
                            errorMsg.remove();
                        }
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                }
            });
            
            // Clear error on input
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(function(input) {
                input.addEventListener('input', function() {
                    this.classList.remove('error');
                    const errorMsg = this.parentElement.querySelector('.error-message');
                    if (errorMsg) {
                        errorMsg.remove();
                    }
                });
            });
        });
    }

    // ========================================
    // Utility Functions
    // ========================================
    
    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

})();
