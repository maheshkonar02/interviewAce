import { useState } from 'react';
import Logo, { LogoVariant1, LogoVariant2, LogoVariant3, LogoVariant4, LogoVariant5, LogoVariant6 } from '../components/Logo';

/**
 * Logo Showcase Page
 * View and compare all logo variants
 */
export default function LogoShowcase() {
  const [selectedVariant, setSelectedVariant] = useState(1);
  const [showOnDark, setShowOnDark] = useState(true);

  const variants = [
    { id: 1, name: 'Professional Speech Bubble', component: LogoVariant1, description: 'Clean, professional look with conversation icon' },
    { id: 2, name: 'Success Checkmark', component: LogoVariant2, description: 'Modern, success-oriented with checkmark' },
    { id: 3, name: 'Microphone', component: LogoVariant3, description: 'Bold, interview-focused with microphone' },
    { id: 4, name: 'AI Sparkle', component: LogoVariant4, description: 'Minimalist with AI sparkle/star' },
    { id: 5, name: 'Shield Badge', component: LogoVariant5, description: 'Professional shield/badge design' },
    { id: 6, name: 'Rocket Arrow', component: LogoVariant6, description: 'Modern upward arrow/rocket' }
  ];

  return (
    <div className={`min-h-screen p-8 ${showOnDark ? 'bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700' : 'bg-gray-100'}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 ${showOnDark ? 'text-white' : 'text-gray-900'}`}>
          InterviewAce Logo Showcase
        </h1>

        {/* Background Toggle */}
        <div className="mb-8 flex items-center gap-4">
          <label className={`flex items-center gap-2 ${showOnDark ? 'text-white' : 'text-gray-900'}`}>
            <input
              type="checkbox"
              checked={showOnDark}
              onChange={(e) => setShowOnDark(e.target.checked)}
              className="w-4 h-4"
            />
            Show on dark background
          </label>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {variants.map((variant) => {
            const LogoComponent = variant.component;
            return (
              <div
                key={variant.id}
                className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${selectedVariant === variant.id
                    ? 'border-yellow-400 bg-yellow-400/10'
                    : showOnDark
                      ? 'border-white/20 bg-white/5 hover:bg-white/10'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                onClick={() => setSelectedVariant(variant.id)}
              >
                <div className="flex justify-center mb-4">
                  <LogoComponent className="w-16 h-16" textClassName="text-2xl" textColor={showOnDark ? "text-white" : "text-gray-900"} />
                </div>
                <h3 className={`text-lg font-semibold mb-2 text-center ${showOnDark ? 'text-white' : 'text-gray-900'}`}>
                  {variant.name}
                </h3>
                <p className={`text-sm text-center ${showOnDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {variant.description}
                </p>
                {selectedVariant === variant.id && (
                  <div className="mt-4 text-center">
                    <span className={`text-xs font-bold ${showOnDark ? 'text-yellow-400' : 'text-green-600'}`}>
                      ✓ SELECTED
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Logo Preview */}
        <div className={`p-8 rounded-lg ${showOnDark ? 'bg-white/10 backdrop-blur-md' : 'bg-white shadow-lg'}`}>
          <h2 className={`text-2xl font-bold mb-6 ${showOnDark ? 'text-white' : 'text-gray-900'}`}>
            Selected Logo Preview
          </h2>

          <div className="space-y-8">
            {/* Small Size */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${showOnDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Small (Navbar)
              </h3>
              <Logo variant={selectedVariant} className="w-8 h-8" textClassName="text-xl" textColor={showOnDark ? "text-white" : "text-gray-900"} />
            </div>

            {/* Medium Size */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${showOnDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Medium (Login/Register)
              </h3>
              <Logo variant={selectedVariant} className="w-12 h-12" textClassName="text-2xl" textColor={showOnDark ? "text-white" : "text-gray-900"} />
            </div>

            {/* Large Size */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${showOnDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Large (Hero Section)
              </h3>
              <Logo variant={selectedVariant} className="w-20 h-20" textClassName="text-4xl" textColor={showOnDark ? "text-white" : "text-gray-900"} />
            </div>

            {/* Icon Only */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${showOnDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Icon Only
              </h3>
              <div className="flex items-center gap-4">
                {variants[selectedVariant - 1].component({ className: "w-12 h-12", textClassName: "", textColor: showOnDark ? "text-white" : "text-gray-900" })}
              </div>
            </div>
          </div>

          {/* Usage Code */}
          <div className="mt-8 p-4 bg-black/30 rounded-lg">
            <h3 className="text-white text-sm font-semibold mb-2">Usage Code:</h3>
            <pre className="text-green-400 text-xs overflow-x-auto">
              {`import Logo from './components/Logo';

// Use variant ${selectedVariant}
<Logo variant={${selectedVariant}} />

// Or use specific variant directly
import { LogoVariant${selectedVariant} } from './components/Logo';
<LogoVariant${selectedVariant} />`}
            </pre>
          </div>
        </div>

        {/* Recommendations */}
        <div className={`mt-8 p-6 rounded-lg ${showOnDark ? 'bg-blue-900/30 border border-blue-500/50' : 'bg-blue-50 border border-blue-200'}`}>
          <h3 className={`text-xl font-bold mb-4 ${showOnDark ? 'text-white' : 'text-gray-900'}`}>
            💡 Recommendations
          </h3>
          <ul className={`space-y-2 text-sm ${showOnDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <li><strong>Variant 1 (Speech Bubble):</strong> Best for professional/corporate feel - emphasizes communication</li>
            <li><strong>Variant 2 (Checkmark):</strong> Best for success/achievement focus - clean and modern</li>
            <li><strong>Variant 3 (Microphone):</strong> Best for interview focus - clearly represents the product</li>
            <li><strong>Variant 4 (Sparkle):</strong> Best for AI/tech feel - minimalist and modern</li>
            <li><strong>Variant 5 (Shield):</strong> Best for trust/security - professional badge style</li>
            <li><strong>Variant 6 (Rocket):</strong> Best for growth/success - energetic and dynamic</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

