import React from 'react'

const Footer = () => {
  return (
    <footer className="py-6 px-6 border-t border-[#EBEBEB]/40">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* <GridPulseLogo size="small" /> */}
              <p className="text-sm text-muted-foreground mt-4 md:mt-0">
                © 2025 Grid Pulse. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
  )
}

export default Footer