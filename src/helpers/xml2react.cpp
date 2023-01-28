#include <iostream>
#include <string>
#include <fstream>
#include <sstream>

// open file and write string to it
void writeToFile(std::string filename, std::string content)
{
  std::ofstream myfile;
  myfile.open(filename);
  myfile << content;
  myfile.close();
}

int main(int charc, char *argv[])
{
  std::string line = "", htmlString = "";
  std::ifstream myfile("./text.rss");
  int count = 0;
  bool inLineTag = false;
  if (myfile.is_open())
  {
    while (getline(myfile, line))
    {
      // if(count >= 45) { break; }
      if(inLineTag) 
      {
        std::string::size_type title = line.find("<title>");
        if(title != std::string::npos) 
        {
          std::string::size_type endTitle = line.find("</title>");
          std::string titleStr = line.substr(title + 7, endTitle - title - 7);
          htmlString += "<h1>" + titleStr + "</h1>";
          htmlString += '\n';
        }
        std::string::size_type desc = line.find("<description>");
        if(desc != std::string::npos) 
        {
          std::string::size_type endDesc = line.find("</description>");
          std::string descStr = line.substr(desc + 13, endDesc - desc - 13);
          htmlString += "<div>" + descStr + "</div>";
          htmlString += '\n';
        }
        std::string::size_type link = line.find("<link>");
        if(link != std::string::npos) 
        {
          std::string::size_type endLink = line.find("</link>");
          std::string linkStr = line.substr(link + 6, endLink - link - 6);
          htmlString += "<a href=\"" + linkStr + "\">Read More</a>";
          htmlString += '\n';
        }
        std::string::size_type endItem = line.find("</item>");
        if(endItem != std::string::npos) 
        {
          inLineTag = false;
        }
      }
      std::string::size_type n = line.find("<item>");
      if(n != std::string::npos) 
      {
        inLineTag = true;
      }
      count++;
    }
    myfile.close();
  }
  else
    std::cout << "Unable to open file";

  writeToFile("htmlFile.txt", htmlString);

  return EXIT_SUCCESS;
}
