/* eslint-disable react/no-unescaped-entities */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FiBook,
  FiHome,
  FiLayers,
  FiCode,
  FiSettings,
  FiChevronRight,
  FiCopy,
  FiExternalLink,
  FiCommand,
  FiShield,
  FiUsers,
  FiZap,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  badge?: string;
}

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    icon: <FiHome className="w-4 h-4" />,
    children: [
      {
        title: 'Introduction',
        href: '#introduction',
        icon: <FiBook className="w-4 h-4" />,
      },
      {
        title: 'Key Features',
        href: '#key-features',
        icon: <FiZap className="w-4 h-4" />,
      },
      {
        title: 'How It Works',
        href: '#how-it-works',
        icon: <FiShield className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Technology',
    icon: <FiCode className="w-4 h-4" />,
    children: [
      {
        title: 'Technology Stack',
        href: '#blockchain-layer',
        icon: <FiLayers className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Installation',
    icon: <FiSettings className="w-4 h-4" />,
    children: [
      {
        title: 'Prerequisites',
        href: '#prerequisites',
        icon: <FiCheckCircle className="w-4 h-4" />,
      },
      {
        title: 'Clone & Install',
        href: '#clone-install',
        icon: <FiCommand className="w-4 h-4" />,
      },
      {
        title: 'Environment Setup',
        href: '#environment-setup',
        icon: <FiSettings className="w-4 h-4" />,
      },
      {
        title: 'Deploy Contract',
        href: '#deploy-contract',
        icon: <FiZap className="w-4 h-4" />,
      },
      {
        title: 'Run Frontend',
        href: '#run-frontend',
        icon: <FiCode className="w-4 h-4" />,
      },
    ],
  },
  {
    title: 'Usage Guide',
    href: '#usage-guide',
    icon: <FiUsers className="w-4 h-4" />,
  },
  {
    title: 'Project Structure',
    href: '#project-structure',
    icon: <FiLayers className="w-4 h-4" />,
  },
  {
    title: 'Testing',
    href: '#testing',
    icon: <FiCheckCircle className="w-4 h-4" />,
  },
  {
    title: 'Contributing',
    href: '#contributing',
    icon: <FiUsers className="w-4 h-4" />,
  },
  {
    title: 'References',
    href: '#references',
    icon: <FiBook className="w-4 h-4" />,
  },
];

export default function DocsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Getting Started',
    'Installation',
  ]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toggleSection = (title: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((section) => section !== title) : [...prev, title],
    );
  };

  const copyToClipboard = async (text: string, codeId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const scrollToSection = (sectionId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Remove the # if it exists
    const cleanId = sectionId.replace('#', '');
    console.log('Attempting to scroll to:', cleanId);

    const element = document.getElementById(cleanId);
    if (element) {
      console.log('Found element:', cleanId);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error('Element not found:', cleanId);
      // Try with the original ID as fallback
      const fallbackElement = document.getElementById(sectionId);
      if (fallbackElement) {
        console.log('Found fallback element:', sectionId);
        fallbackElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const isExpanded = expandedSections.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group
            ${item.href ? 'hover:bg-gray-100' : 'hover:bg-gray-50'}
            ${isExpanded ? 'bg-gray-50' : ''}
          `}
          onClick={(e) => {
            if (hasChildren) {
              toggleSection(item.title, e);
            } else if (item.href) {
              scrollToSection(item.href, e);
            }
          }}
        >
          <div className="flex items-center gap-2">
            {item.icon && <span className="text-gray-500">{item.icon}</span>}
            <span
              className={`text-sm font-medium ${level > 0 ? 'text-gray-600' : 'text-gray-900'}`}
            >
              {item.title}
            </span>
            {item.badge && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {item.badge}
              </span>
            )}
          </div>
          {hasChildren && (
            <span
              className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            >
              <FiChevronRight className="w-4 h-4 text-gray-400" />
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <FiBook className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  DropDis
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
                <span className="text-purple-600 font-medium">Documentation</span>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Back to App
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 h-screen sticky top-16 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Documentation
              </h3>
              <div className="space-y-1">{navigation.map((item) => renderNavItem(item))}</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-8 py-8 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            {/* Introduction Section */}
            <section id="introduction" className="mb-16 scroll-mt-24 docs-section">
              <div className="flex items-center gap-2 mb-4">
                <h1 className="text-4xl font-bold text-gray-900 mb-0">DropDis Documentation</h1>
                <span className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full">
                  v1.0
                </span>
              </div>
              <p className="text-xl text-gray-600 leading-relaxed">
                Where privacy meets payroll. DropDis is a groundbreaking DApp that leverages Zama's
                fhEVM to enable fully confidential salary distributions.
              </p>
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">
                  <FiShield className="w-4 h-4" />
                  FHE Powered
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">
                  <FiUsers className="w-4 h-4" />
                  Enterprise Ready
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md">
                  <FiZap className="w-4 h-4" />
                  Gas Optimized
                </span>
              </div>
            </section>

            {/* Key Features Section */}
            <section id="key-features" className="mb-16 scroll-mt-24 docs-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FiShield className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">End-to-End Encryption</h3>
                  </div>
                  <p className="text-gray-600">
                    Employee addresses and salaries are encrypted on the client-side and remain
                    private throughout the entire process.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FiZap className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Efficient Batch Processing
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    Distribute salaries to hundreds of employees in a single, gas-optimized
                    transaction.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FiClock className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Real-Time UI Feedback</h3>
                  </div>
                  <p className="text-gray-600">
                    Watch as each employee's data is encrypted with a beautiful, responsive
                    interface that shows live status updates.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <FiLayers className="w-6 h-6 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Interactive Dashboard</h3>
                  </div>
                  <p className="text-gray-600">
                    Get a complete, historical overview of all salary batches, their status, and
                    detailed payout information.
                  </p>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="mb-16 scroll-mt-24 docs-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                How It Works: The Magic of FHE
              </h2>
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 mb-6">
                <p className="text-gray-700 mb-4">
                  Traditional blockchains are public. With fhEVM, DropDis can perform calculations
                  on encrypted data. Think of it like sending a locked box to the blockchain. The
                  contract can verify the total amount inside the box is correct, but it can't see
                  what's inside until you, the owner, provide the special key.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Add Employee Data',
                    desc: 'User inputs employee information through the frontend',
                  },
                  {
                    step: 2,
                    title: 'Encrypt Data Locally',
                    desc: 'Frontend encrypts data using FHE before sending to blockchain',
                  },
                  {
                    step: 3,
                    title: 'Submit Encrypted Batch',
                    desc: 'Encrypted data is submitted to the smart contract',
                  },
                  {
                    step: 4,
                    title: 'Request Decryption',
                    desc: 'Contract requests decryption from FHE Oracle',
                  },
                  {
                    step: 5,
                    title: 'Secure Decryption',
                    desc: 'Oracle securely decrypts data off-chain',
                  },
                  {
                    step: 6,
                    title: 'Execute Transfers',
                    desc: 'Contract distributes salaries with decrypted data',
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Technology Stack Section */}
            <section id="blockchain-layer" className="mb-16 scroll-mt-24 docs-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Technology Stack</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Layer</h3>
              <div className="mb-8 overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technology
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Blockchain
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        Zama fhEVM (Sepolia Testnet)
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Language
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Solidity ^0.8.24</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Environment
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Hardhat</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Core Library
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">@fhevm/contracts</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Frontend Layer</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technology
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Framework
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Next.js 16 (App Router)</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Language
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">TypeScript</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Styling
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Tailwind CSS</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Web3 Library
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Ethers.js v6</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        FHE Library
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        @zama-fhe/relayer-sdk/bundle
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Notifications
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">Sonner</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Installation Section */}
            <section id="prerequisites" className="mb-16 scroll-mt-24 docs-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started</h2>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">Prerequisites</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
                <li>Node.js v18+</li>
                <li>pnpm (recommended), npm, or yarn</li>
                <li>A Web3 wallet (e.g., MetaMask) with the Zama Sepolia network configured</li>
                <li>Some Sepolia testnet ETH</li>
              </ul>

              <h3 id="clone-install" className="text-xl font-semibold text-gray-900 mb-4">
                Clone & Install
              </h3>
              <div className="relative mb-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`git clone https://github.com/unamul/drop-dis.git
cd drop-dis

# Install dependencies
pnpm install`}</code>
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `git clone https://github.com/unamul/drop-dis.git
cd drop-dis

# Install dependencies
pnpm install`,
                      'clone-install',
                    )
                  }
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'clone-install' ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <h3 id="environment-setup" className="text-xl font-semibold text-gray-900 mb-4">
                Environment Setup
              </h3>
              <p className="text-gray-600 mb-4">Create environment file:</p>
              <div className="relative mb-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>frontend/.env.local</code>
                </pre>
              </div>

              <div className="relative mb-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`MNEMONIC=
INFURA_API_KEY=
ETHERSCAN_API_KEY=

NEXT_PUBLIC_CONTRACT_ADDRESS=0x684468E7fe477AaB7525573106eB88F3D18B9Ce2
PRIVATE_KEY=
BATCH_SIZE=50`}</code>
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `MNEMONIC=
INFURA_API_KEY=
ETHERSCAN_API_KEY=

NEXT_PUBLIC_CONTRACT_ADDRESS=0x684468E7fe477AaB7525573106eB88F3D18B9Ce2
PRIVATE_KEY=
BATCH_SIZE=50`,
                      'env-config',
                    )
                  }
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'env-config' ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <h3 id="deploy-contract" className="text-xl font-semibold text-gray-900 mb-4">
                Compile & Deploy Contract
              </h3>
              <div className="relative mb-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`# Compile the Solidity code
pnpm compile

# Deploy to Sepolia testnet
pnpm deploy:sepolia`}</code>
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `# Compile the Solidity code
pnpm compile

# Deploy to Sepolia testnet
pnpm deploy:sepolia`,
                      'deploy-contract',
                    )
                  }
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'deploy-contract' ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <h3 id="run-frontend" className="text-xl font-semibold text-gray-900 mb-4">
                Run the Frontend
              </h3>
              <p className="text-gray-600 mb-4">From the frontend directory:</p>
              <div className="relative mb-6">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>pnpm dev</code>
                </pre>
                <button
                  onClick={() => copyToClipboard('pnpm dev', 'run-frontend')}
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'run-frontend' ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <p className="text-gray-600">
                Navigate to{' '}
                <a
                  href="http://localhost:3000"
                  className="text-purple-600 hover:text-purple-700 underline flex items-center gap-1 inline-flex"
                >
                  http://localhost:3000 <FiExternalLink className="w-3 h-3" />
                </a>{' '}
                to start using DropDis!
              </p>
            </section>

            {/* Usage Guide Section */}
            <section id="usage-guide" className="mb-16 scroll-mt-24 docs-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Usage Guide</h2>
              <ol className="space-y-4 text-gray-900">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <strong className="text-gray-900">Connect Wallet:</strong> Ensure your wallet is
                    connected to the Sepolia network.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <div>
                    <strong className="text-gray-900">Add Employees:</strong> Enter an employee's
                    address and salary. Click <strong>Add Employee</strong>.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <strong className="text-gray-900">Monitor Encryption:</strong> The employee
                    appears in the list with a loading spinner. Once encrypted, it turns green. You
                    can add multiple employees simultaneously.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </span>
                  <div>
                    <strong className="text-gray-900">Distribute:</strong> Once all employees are
                    encrypted, the <strong>Distribute Now</strong> button becomes active. Click it
                    to submit the batch to the blockchain.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    5
                  </span>
                  <div>
                    <strong className="text-gray-900">Track Progress:</strong> The UI shows the live
                    status of the decryption and payment process.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    6
                  </span>
                  <div>
                    <strong className="text-gray-900">View History:</strong> Visit the{' '}
                    <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded">/dashboard</code>{' '}
                    to see a complete history of all salary batches.{' '}
                    <span className="text-purple-600 font-medium">#ComingSoon</span>
                  </div>
                </li>
              </ol>
            </section>

            {/* Project Structure Section */}
            <section id="project-structure" className="mb-16 scroll-mt-24 docs-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Project Structure</h2>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{`DROP-DIS/
│
├── app/                                # Next.js 16 App Router (frontend pages)
│   ├── favicon.ico                     # Website favicon
│   ├── globals.css                     # Global Tailwind / CSS styles
│   ├── layout.tsx                      # Root layout wrapper for pages
│   ├── page.tsx                        # Main landing page of the DApp
│   └── docs/                           # Documentation pages
│       └── page.tsx                    # GitBook-style documentation
│
├── components/                         # Reusable React components for UI
│   ├── BatchStatus.tsx                 # Component to show batch processing status
│   ├── Card.tsx                        # UI card to display employee info
│   ├── EmployeeForm.tsx                # Form to add new employees with encryption
│   ├── EmployeeList.tsx                # List displaying all employees
│   └── FHEVM.tsx                       # Handles Zama FHEVM initialization logic
│
├── contracts/                          # Solidity smart contracts
│   └── DropDis.sol                     # Main contract handling encrypted distribution
│
├── deploy/                             # Deployment scripts for Hardhat
│   └── deploy.ts                       # Script to deploy DropDis.sol to the network
│
├── deployments/                        # Stores deployed contract addresses & metadata
│
├── ignition/                           # Hardhat Ignition scripts (structured deployment)
│
├── lib/                                # Custom libraries (optional utilities or hooks)
│
├── public/                             # Static assets (images, fonts, etc.)
│
├── test/                               # Smart contract tests
│   └── dropDis.test.ts                 # Unit tests for DropDis contract
│
├── types/                              # TypeScript type definitions (e.g. contract types)
│
├── utils/                              # Helper functions and config files
│   ├── abi/
│   │   ├── DropDis.json                # Compiled ABI of DropDis.sol
│   │   └── ABI.ts                      # ABI export helper for frontend
│   ├── contract.ts                     # Ethers.js contract interaction setup
│   └── fheClient.ts                    # Zama FHEVM client initialization (encrypt/decrypt)
│
├── .env                                # Environment variables (private keys, RPC URLs)
│
├── package.json                        # NPM dependencies and scripts
├── hardhat.config.ts                   # Hardhat configuration file
├── tsconfig.json                       # TypeScript configuration
├── next.config.js                      # Next.js configuration
└── README.md                           # Project documentation (GitHub)`}</code>
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `DROP-DIS/
│
├── app/                                # Next.js 16 App Router (frontend pages)
│   ├── favicon.ico                     # Website favicon
│   ├── globals.css                     # Global Tailwind / CSS styles
│   ├── layout.tsx                      # Root layout wrapper for pages
│   ├── page.tsx                        # Main landing page of the DApp
│   └── docs/                           # Documentation pages
│       └── page.tsx                    # GitBook-style documentation
│
├── components/                         # Reusable React components for UI
│   ├── BatchStatus.tsx                 # Component to show batch processing status
│   ├── Card.tsx                        # UI card to display employee info
│   ├── EmployeeForm.tsx                # Form to add new employees with encryption
│   ├── EmployeeList.tsx                # List displaying all employees
│   └── FHEVM.tsx                       # Handles Zama FHEVM initialization logic
│
├── contracts/                          # Solidity smart contracts
│   └── DropDis.sol                     # Main contract handling encrypted distribution
│
├── deploy/                             # Deployment scripts for Hardhat
│   └── deploy.ts                       # Script to deploy DropDis.sol to the network
│
├── deployments/                        # Stores deployed contract addresses & metadata
│
├── ignition/                           # Hardhat Ignition scripts (structured deployment)
│
├── lib/                                # Custom libraries (optional utilities or hooks)
│
├── public/                             # Static assets (images, fonts, etc.)
│
├── test/                               # Smart contract tests
│   └── dropDis.test.ts                 # Unit tests for DropDis contract
│
├── types/                              # TypeScript type definitions (e.g. contract types)
│
├── utils/                              # Helper functions and config files
│   ├── abi/
│   │   ├── DropDis.json                # Compiled ABI of DropDis.sol
│   │   └── ABI.ts                      # ABI export helper for frontend
│   ├── contract.ts                     # Ethers.js contract interaction setup
│   └── fheClient.ts                    # Zama FHEVM client initialization (encrypt/decrypt)
│
├── .env                                # Environment variables (private keys, RPC URLs)
│
├── package.json                        # NPM dependencies and scripts
├── hardhat.config.ts                   # Hardhat configuration file
├── tsconfig.json                       # TypeScript configuration
├── next.config.js                      # Next.js configuration
└── README.md                           # Project documentation (GitHub)`,
                      'project-structure',
                    )
                  }
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'project-structure' ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </section>

            {/* Testing Section */}
            <section id="testing" className="mb-16 scroll-mt-24 docs-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Running Tests</h2>
              <p className="text-gray-600 mb-4">
                This project uses the Zama FHE mock environment for testing, which simulates the
                entire encryption/decryption flow.
              </p>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                  <code>{`#
pnpm test`}</code>
                </pre>
                <button
                  onClick={() =>
                    copyToClipboard('# From the /contracts directory\npnpm test', 'test-command')
                  }
                  className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedCode === 'test-command' ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiCopy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </section>

            {/* Contributing Section */}
            <section id="contributing" className="mb-16 scroll-mt-24 docs-section">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contributing</h2>
              <p className="text-gray-600 mb-6">
                We welcome contributions! Whether it's a bug fix, a new feature, or an improvement
                to the documentation, your help is appreciated.
              </p>
              <ol className="space-y-3 text-gray-900">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <strong className="text-gray-900">Fork</strong> the repository.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    2
                  </span>
                  <div>
                    Create your feature branch (
                    <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      git checkout -b feature/amazing-feature
                    </code>
                    ).
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <strong className="text-gray-900">Commit</strong> your changes (
                    <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      git commit -m 'Add some amazing feature'
                    </code>
                    ).
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    4
                  </span>
                  <div>
                    <strong className="text-gray-900">Push</strong> to the branch (
                    <code className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      git push origin feature/amazing-feature
                    </code>
                    ).
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    5
                  </span>
                  <div>
                    Open a <strong className="text-gray-900">Pull Request</strong>.
                  </div>
                </li>
              </ol>
            </section>

            {/* References Section */}
            <section id="references" className="mb-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">References</h2>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-gray-700">
                    A huge thanks to the{' '}
                    <a
                      href="https://www.zama.ai/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-700 underline flex items-center gap-1 inline-flex"
                    >
                      Zama team <FiExternalLink className="w-3 h-3" />
                    </a>{' '}
                    for building the future of confidential smart contracts.
                  </p>
                </div>
                <p className="text-gray-600">
                  Built with the amazing tools from{' '}
                  <a
                    href="https://hardhat.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline flex items-center gap-1 inline-flex"
                  >
                    Hardhat <FiExternalLink className="w-3 h-3" />
                  </a>
                  ,{' '}
                  <a
                    href="https://nextjs.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-900 hover:text-gray-700 underline flex items-center gap-1 inline-flex"
                  >
                    Next.js <FiExternalLink className="w-3 h-3" />
                  </a>
                  , and{' '}
                  <a
                    href="https://tailwindcss.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-600 hover:text-cyan-700 underline flex items-center gap-1 inline-flex"
                  >
                    Tailwind CSS <FiExternalLink className="w-3 h-3" />
                  </a>
                  .
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                © 2025 DropDis. Built with ❤️ for privacy-preserving payroll.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/unamul/drop-dis"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <FiExternalLink className="w-4 h-4" />
                  GitHub
                </a>
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <FiHome className="w-4 h-4" />
                  Back to App
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
