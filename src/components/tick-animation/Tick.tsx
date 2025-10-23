"use client";
import React, { useState, useEffect } from "react"
import "./style.css"

export default function Tick({loading, children}: {loading: boolean, children?: React.ReactNode}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <section>
        <div className="rt-container ">
          <div className="col-rt-12">
            <div className="Scriptcontent flex flex-col items-center">
              <div className="circle-loader">
                <div className="checkmark draw" style={{display: "none"}}></div>
              </div>		
              <div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
<section>
    <div className="rt-container ">
        <div className="col-rt-12">
            <div className="Scriptcontent flex flex-col items-center">
                <div className={`circle-loader ${loading && "load-complete"}`}>
                    <div className="checkmark draw" style={{display: `${loading ?  "block" : "none"}`}}></div>
                </div>		
                <div>
                    {children}
                </div>
		</div>
	</div>
    </div>
</section>
		

  )
}
