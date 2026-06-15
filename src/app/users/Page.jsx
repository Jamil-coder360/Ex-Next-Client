import React from 'react'

const UserPage = async() => {
    const res = await fetch("http://localhost:4000/jack");
    const users = await res.json();
    console.log(users); 
  return (
    <div>

    </div>
  )
}

export default UserPage