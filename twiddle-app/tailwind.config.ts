import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			'primary-500': '#877EFF',
  			'secondary-500': '#FFB620',
  			blue: '#0095F6',
  			'logout-btn': '#FF5A5A',
  			'navbar-menu': 'rgba(16, 16, 18, 0.6)',
  			'dark-1': '#000000',
  			'dark-2': '#121417',
  			'dark-3': '#101012',
  			'dark-4': '#1F1F22',
  			'light-1': '#FFFFFF',
  			'light-2': '#EFEFEF',
  			'light-3': '#7878A3',
  			'light-4': '#5C5C7B',
  			'gray-1': '#697C89',
  			glassmorphism: 'rgba(16, 16, 18, 0.60)'
  		},
  		screens: {
  			xs: '400px'
  		},
  		fontSize: {
  			'subtle-medium': [				"12px",				{					lineHeight: "16px",					fontWeight: "500",				},			],
  			'base-regular': [				"16px",				{					lineHeight: "140%",					fontWeight: "400",				},			],
  			'heading2-bold': [				"30px",				{					lineHeight: "140%",					fontWeight: "700",				},			],
  			'heading4-medium': [				"20px",				{					lineHeight: "140%",					fontWeight: "500",				},			],
  			'base-semibold': [				"16px",				{					lineHeight: "140%",					fontWeight: "600",				},			],
  			'small-medium': [				"14px",				{					lineHeight: "140%",					fontWeight: "500",				},			],
  			'small-regular': [				"14px",				{				  lineHeight: "140%",				  fontWeight: "400",				},			  ],
  			'tiny-medium': [				"10px",				{				  lineHeight: "140%",				  fontWeight: "500",				},			  ],
  			'small-semibold': [				"14px",				{				  lineHeight: "140%",				  fontWeight: "600",				},			  ],
  			'heading3-bold': [				"24px",				{				  lineHeight: "140%",				  fontWeight: "700",				},			  ],
  			'base-medium': [          "16px",          {            lineHeight: "140%",            fontWeight: "500",          },        ]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
