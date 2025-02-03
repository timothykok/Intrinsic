import Link from "next/link";

export default function Footer() {
    return (
        <>
    <footer class="bg-white p-12">
    <div class="container mx-auto px-4">
        <ul class="flex flex-row gap-8  list-none p-12 mb-6">
            <li>
                <h3 class="font-bold mb-2">Releases</h3>
                <ul class="flex flex-col gap-2">
                    <li><a href="/integrations" class="text-gray-700 hover:text-gray-900">Integrations</a></li>
                    <li><a href="/notion" class="text-gray-700 hover:text-gray-900">Notion</a></li>
                    <li><a href="/twitter" class="text-gray-700 hover:text-gray-900">Twitter</a></li>
                    <li><a href="/apple-vision-pro" class="text-gray-700 hover:text-gray-900">Vision Pro</a></li>
                    <li><a href="/serendipity" class="text-gray-700 hover:text-gray-900">100 Million</a></li>
                    <li><a href="/nexus" class="text-gray-700 hover:text-gray-900">Nexus AI</a></li>
                    <li><a href="https://library.clay.earth/hc/en-us/sections/6655291907995-What-s-New" target="_blank" class="text-gray-700 hover:text-gray-900">What's New</a></li>
                </ul>
            </li>
            <li>
                <h3 class="font-bold mb-2">Resources</h3>
                <ul class="flex flex-col gap-2">
                    <li><a href="/stories" class="text-gray-700 hover:text-gray-900">Stories</a></li>
                    <li><a href="/start" class="text-gray-700 hover:text-gray-900">Our Apps</a></li>
                    <li><a href="https://library.clay.earth/" target="_blank" class="text-gray-700 hover:text-gray-900">Library</a></li>
                    <li><a href="https://www.youtube.com/@clayhq/playlists" target="_blank" class="text-gray-700 hover:text-gray-900">Tutorials</a></li>
                </ul>
            </li>
            <li>
                <h3 class="font-bold mb-2">Company</h3>
                <ul class="flex flex-col gap-2">
                    <li><a href="/about" class="text-gray-700 hover:text-gray-900">About Clay</a></li>
                    <li><a href="/story" class="text-gray-700 hover:text-gray-900">Our Origins</a></li>
                    <li><a href="/lifestyle" class="text-gray-700 hover:text-gray-900">Lifestyle</a></li>
                    <li><a href="/contact" class="text-gray-700 hover:text-gray-900">Contact</a></li>
                    <li><a href="/pricing" class="text-gray-700 hover:text-gray-900">Pricing</a></li>
                </ul>
            </li>
        </ul>

        <div class="grid grid-cols-[120px_1fr_120px] gap-4 items-center pt-6 border-t border-gray-300">
        <Link href="/"> 
            <img
                    src="/Intrinsic..png"
                    alt="View More"
                    className="w-[84px] h-[18px]"
                    href="/"
                  />
            </Link>

            <ul class="flex gap-4 justify-center">
                <li><a href="https://library.clay.earth/hc/en-us/articles/7485741581339-Security-and-Privacy" target="_blank" class="text-gray-700 hover:text-gray-900">Privacy</a></li>
                <li><a href="/directory/tags" class="text-gray-700 hover:text-gray-900">Directory</a></li>
            </ul>

            <div class="flex gap-4 justify-end">
                <a href="https://www.linkedin.com/company/clayhq/" target="_blank" class="text-gray-700 hover:text-gray-900">
                    {/* <!-- LinkedIn SVG --> */}
                    <svg class="w-4 h-4" viewBox="0 0 16 16">
                        <path fill="currentColor" opacity="0.6" d="M12.57 11.43h-2.02V8.62c0-.74-.32-1.24-1.01-1.24-.53 0-.83.34-.97.66-.05.12-.04.28-.04.45v2.94h-2s.03-4.98 0-5.44h2v.86c.12-.38.76-.9 1.78-.9 1.27 0 2.26.77 2.26 2.46v3.02ZM4.5 5.3c-.65 0-1.07-.41-1.07-.94s.43-.94 1.09-.94c.65 0 1.06.4 1.07.94 0 .53-.42.94-1.09.94ZM3.66 6h1.78v5.44H3.66V5.99Z"></path>
                    </svg>
                </a>
                <a href="https://www.youtube.com/@clayhq" target="_blank" class="text-gray-700 hover:text-gray-900">
                    {/* <!-- YouTube SVG --> */}
                    <svg class="w-4 h-4" viewBox="0 0 16 16">
                        <path fill="currentColor" opacity="0.6" d="M6.04 4.1a.71.71 0 0 0-.7-.01.68.68 0 0 0-.34.59v6.64c0 .24.13.47.34.59a.73.73 0 0 0 .7 0l5.94-3.26a.68.68 0 0 0 .35-.58.68.68 0 0 0-.34-.6L6.04 4.1Z"></path>
                    </svg>
                </a>
                <a href="https://dribbble.com/clayhq" target="_blank" class="text-gray-700 hover:text-gray-900">
                    {/* <!-- Dribbble SVG --> */}
                    <svg class="w-4 h-4" viewBox="0 0 16 16">
                        <path fill="currentColor" opacity="0.6" d="M8 3.33a4.67 4.67 0 1 1 0 9.35 4.67 4.67 0 0 1 0-9.35Zm.63 5.43-.21.09a5.07 5.07 0 0 0-2.65 2.13l-.04.07.12.09c.56.39 1.22.62 1.92.66H8c.43 0 .85-.06 1.25-.2l.23-.1-.07.04-.03-.16c-.12-.66-.34-1.49-.66-2.37l-.09-.25Zm1.09-.24-.17.02.13.35c.1.31.2.62.28.92l.11.45c.07.26.12.5.16.7l.02.1.06-.04a3.78 3.78 0 0 0 1.4-2.2l.03-.13-.08-.02c-.5-.14-1.2-.23-1.94-.15ZM8.06 7.45l-.36.1a14.18 14.18 0 0 1-3.6.43h.1V8c0 .88.3 1.7.82 2.37l.07.08v-.02c.16-.24.36-.5.63-.8l.17-.18a5.79 5.79 0 0 1 2.38-1.52h.02l-.05-.11a10.1 10.1 0 0 0-.1-.22l-.08-.15Zm2.96-1.75-.01.01c-.37.45-.98.94-1.88 1.35l-.15.07.03.06.13.28.06.13.05.12v.01l.29-.02c.48-.04.98-.03 1.48.02l.37.05.51.08-.1-.02v-.11c-.06-.7-.3-1.38-.71-1.95l-.07-.08ZM6.2 4.66a3.82 3.82 0 0 0-1.86 2.35l-.03.1h.09c.78 0 1.89-.12 3.05-.4l.2-.05-.02-.02-.08-.14c-.39-.67-.73-1.19-1.1-1.7l-.13-.2-.12.06ZM8 4.2c-.22 0-.45.02-.67.06l-.18.04.1-.03.06.07c.34.48.76 1.11 1.15 1.8l.13.23.15-.06a4.23 4.23 0 0 0 1.69-1.18l.02-.03-.1-.09a3.79 3.79 0 0 0-2.12-.8H8Z"></path>
                    </svg>
                </a>
                <a href="https://twitter.com/clayHQ" target="_blank" class="text-gray-700 hover:text-gray-900">
                    {/* <!-- Twitter SVG --> */}
                    <svg class="w-4 h-4" viewBox="0 0 16 16">
                        <path fill="currentColor" opacity="0.6" d="M13.14 5.01c-.38.18-.78.3-1.2.35.43-.27.76-.7.92-1.2-.4.25-.86.43-1.34.52A2.08 2.08 0 0 0 9.98 4a2.14 2.14 0 0 0-2.06 2.66 5.94 5.94 0 0 1-4.35-2.27 2.2 2.2 0 0 0 .66 2.9c-.35-.02-.67-.11-.96-.27v.02c0 1.05.73 1.93 1.7 2.12A2.01 2.01 0 0 1 4 9.2a2.12 2.12 0 0 0 1.97 1.5 4.17 4.17 0 0 1-3.12.9c.93.61 2.04.97 3.23.97 3.88 0 6-3.3 6-6.15v-.29c.41-.3.77-.68 1.05-1.12"></path>
                    </svg>
                </a>
            </div>
        </div>
    </div>
</footer>
      </>
    );
  }