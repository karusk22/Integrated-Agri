export default function ChatBotMenu() {
  return (
    <div>
        <div className="w-full text-center">
            <div></div> {/*Container for showing conversations*/}
            <input type="text" placeholder="Ask our assistant your doubts related to our products." className="w-1/2 pt-3 pb-3 pl-8 pr-8"/>
            <input type="submit" value="Send" className="bg-[#0C9489] pt-3 pb-3 pl-8 pr-8 rounded-full text-white font-bold" />
        </div>
    </div>
  )
}
